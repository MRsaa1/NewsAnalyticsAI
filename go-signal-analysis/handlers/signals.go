package handlers

import (
	"net/http"
	"signal-analysis/database"
	"signal-analysis/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetSignals(c *gin.Context) {
	db := database.GetDB()

	// Параметры запроса
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	sector := c.Query("sector")
	region := c.Query("region")
	minImpact, _ := strconv.Atoi(c.DefaultQuery("min_impact", "0"))
	minConfidence, _ := strconv.Atoi(c.DefaultQuery("min_confidence", "0"))
	dateFrom := c.Query("date_from")

	// Построение запроса
	query := db.Model(&models.Signal{})

	// Фильтры
	if sector != "" {
		query = query.Where("sector = ?", sector)
	}
	if region != "" {
		query = query.Where("region = ?", region)
	}
	if minImpact > 0 {
		query = query.Where("impact >= ?", minImpact)
	}
	if minConfidence > 0 {
		query = query.Where("confidence >= ?", minConfidence)
	}
	if dateFrom != "" {
		query = query.Where("ts_published >= ?", dateFrom)
	}

	// Исключаем тестовые сигналы
	query = query.Where("is_test = ?", false)

	// Сортировка и лимит
	var signals []models.Signal
	err := query.Order("ts_published DESC").Limit(limit).Find(&signals).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, signals)
}

func GetStats(c *gin.Context) {
	db := database.GetDB()

	var total int64
	var highImpact int64
	var mediumImpact int64
	var avgConfidence float64
	var bullish int64
	var bearish int64
	var sectors int64

	// Общее количество
	db.Model(&models.Signal{}).Where("is_test = ?", false).Count(&total)

	// Высокое влияние (70+)
	db.Model(&models.Signal{}).Where("is_test = ? AND impact >= ?", false, 70).Count(&highImpact)

	// Среднее влияние (50-69)
	db.Model(&models.Signal{}).Where("is_test = ? AND impact >= ? AND impact < ?", false, 50, 70).Count(&mediumImpact)

	// Средняя достоверность
	db.Model(&models.Signal{}).Where("is_test = ?", false).Select("AVG(confidence)").Scan(&avgConfidence)

	// Бычьи сигналы
	db.Model(&models.Signal{}).Where("is_test = ? AND sentiment > ?", false, 0).Count(&bullish)

	// Медвежьи сигналы
	db.Model(&models.Signal{}).Where("is_test = ? AND sentiment < ?", false, 0).Count(&bearish)

	// Количество секторов
	db.Model(&models.Signal{}).Where("is_test = ?", false).Distinct("sector").Count(&sectors)

	stats := gin.H{
		"total":          total,
		"high_impact":    highImpact,
		"medium_impact":  mediumImpact,
		"avg_confidence": avgConfidence,
		"bullish":        bullish,
		"bearish":        bearish,
		"sectors":        sectors,
	}

	c.JSON(http.StatusOK, stats)
}




