package handlers

import (
	"net/http"
	"signal-analysis/database"
	"signal-analysis/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GenerateAnalysisPage(c *gin.Context) {
	signalID := c.Param("signal_id")
	language := c.DefaultQuery("lang", "en")

	db := database.GetDB()
	var signal models.Signal

	// Найти сигнал
	if err := db.Where("id = ?", signalID).First(&signal).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.HTML(http.StatusNotFound, "error.html", gin.H{"error": "Signal not found"})
			return
		}
		c.HTML(http.StatusInternalServerError, "error.html", gin.H{"error": "Database error"})
		return
	}

	// Генерируем аналитику через DeepSeek
	analysis, err := callDeepSeek(signal, language)
	if err != nil {
		c.HTML(http.StatusInternalServerError, "error.html", gin.H{"error": "Analysis generation failed"})
		return
	}

	// Сохраняем аналитику в базу
	signal.Analysis = analysis

	if err := db.Save(&signal).Error; err != nil {
		c.HTML(http.StatusInternalServerError, "error.html", gin.H{"error": "Failed to save analysis"})
		return
	}

	// Перенаправляем обратно на дашборд
	c.Redirect(http.StatusSeeOther, "/dashboard?lang="+language)
}




