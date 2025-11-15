package database

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open("../signals.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Skip auto migration - using existing database
	// err = DB.AutoMigrate(&models.Signal{}, &models.Curation{})
	// if err != nil {
	// 	log.Fatal("Failed to migrate database:", err)
	// }

	log.Println("Database connected successfully")
}

func GetDB() *gorm.DB {
	return DB
}
