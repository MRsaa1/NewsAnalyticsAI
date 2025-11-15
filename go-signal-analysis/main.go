package main

import (
	"log"
	"signal-analysis/database"
	"signal-analysis/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	// Инициализация базы данных
	database.InitDB()

	// Настройка Gin
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// Статические файлы
	r.Static("/static", "./static")

	// HTML шаблоны
	r.LoadHTMLGlob("templates/*")

	// Главная страница
	r.GET("/", func(c *gin.Context) {
		c.Redirect(302, "/dashboard")
	})

	// Дашборд с серверным рендерингом
	r.GET("/dashboard", handlers.Dashboard)

	// API маршруты
	api := r.Group("/api")
	{
		api.GET("/signals", handlers.GetSignals)
		api.GET("/stats", handlers.GetStats)
		api.POST("/generate-analysis/:signal_id", handlers.GenerateAnalysis)
	}

	// Генерация аналитики
	r.GET("/generate-analysis/:signal_id", handlers.GenerateAnalysisPage)

	// Запуск сервера
	log.Println("🚀 Starting SAA Alliance Analytics Server on :8090")
	log.Println("📊 Dashboard: http://localhost:8090/dashboard")

	if err := r.Run(":8090"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
