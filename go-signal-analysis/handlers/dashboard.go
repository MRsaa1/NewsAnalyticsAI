package handlers

import (
	"net/http"
	"signal-analysis/database"
	"signal-analysis/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

type DashboardData struct {
	Language string
	Filters  FilterParams
	Signals  []models.Signal
	Stats    *StatsData
}

type FilterParams struct {
	Sector     string
	Region     string
	Impact     int
	Confidence int
}

type StatsData struct {
	Total         int64
	HighImpact    int64
	MediumImpact  int64
	AvgConfidence float64
	Bullish       int64
	Bearish       int64
}

func Dashboard(c *gin.Context) {
	// Получаем параметры фильтрации
	sector := c.Query("sector")
	region := c.Query("region")
	impact, _ := strconv.Atoi(c.DefaultQuery("impact", "0"))
	confidence, _ := strconv.Atoi(c.DefaultQuery("confidence", "0"))
	language := c.DefaultQuery("lang", "en")

	// Загружаем сигналы
	signals := loadSignals(sector, region, impact, confidence)

	// Загружаем статистику ТОЛЬКО если есть фильтры
	var stats *StatsData
	if sector != "" || region != "" || impact > 0 || confidence > 0 {
		stats = loadStats(sector, region, impact, confidence)
	}

	// Подготавливаем данные для шаблона
	data := DashboardData{
		Language: language,
		Filters: FilterParams{
			Sector:     sector,
			Region:     region,
			Impact:     impact,
			Confidence: confidence,
		},
		Signals: signals,
		Stats:   stats,
	}

	// Рендерим HTML
	c.HTML(http.StatusOK, "dashboard.html", data)
}

func loadSignals(sector, region string, impact, confidence int) []models.Signal {
	db := database.GetDB()

	query := db.Model(&models.Signal{})

	// ВСЕГДА исключаем тестовые сигналы
	query = query.Where("is_test = ?", false)

	// Фильтры - только если параметры переданы
	if sector != "" {
		query = query.Where("sector = ?", sector)
	}
	if region != "" {
		query = query.Where("region = ?", region)
	}
	if impact > 0 {
		query = query.Where("impact >= ?", impact)
	}
	if confidence > 0 {
		query = query.Where("confidence >= ?", confidence)
	}

	// Сортировка и лимит
	var signals []models.Signal
	query.Order("ts_published DESC").Limit(50).Find(&signals)

	return signals
}

func loadStats(sector, region string, impact, confidence int) *StatsData {
	db := database.GetDB()

	// Строим запрос с теми же фильтрами что и для сигналов
	query := db.Model(&models.Signal{})

	// ВСЕГДА исключаем тестовые сигналы
	query = query.Where("is_test = ?", false)

	// Фильтры - только если параметры переданы
	if sector != "" {
		query = query.Where("sector = ?", sector)
	}
	if region != "" {
		query = query.Where("region = ?", region)
	}
	if impact > 0 {
		query = query.Where("impact >= ?", impact)
	}
	if confidence > 0 {
		query = query.Where("confidence >= ?", confidence)
	}

	var stats StatsData

	// Общее количество с фильтрами
	query.Count(&stats.Total)

	// Высокое влияние (70+) с фильтрами
	query.Where("impact >= ?", 70).Count(&stats.HighImpact)

	// Среднее влияние (50-69) с фильтрами
	query.Where("impact >= ? AND impact < ?", 50, 70).Count(&stats.MediumImpact)

	// Средняя достоверность с фильтрами
	query.Select("AVG(confidence)").Scan(&stats.AvgConfidence)

	// Бычьи сигналы с фильтрами
	query.Where("sentiment > ?", 0).Count(&stats.Bullish)

	// Медвежьи сигналы с фильтрами
	query.Where("sentiment < ?", 0).Count(&stats.Bearish)

	return &stats
}
