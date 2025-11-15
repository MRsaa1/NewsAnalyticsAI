package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"signal-analysis/database"
	"signal-analysis/models"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AnalysisRequest struct {
	Language string `json:"language"`
}

type DeepSeekRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type DeepSeekResponse struct {
	Choices []Choice `json:"choices"`
}

type Choice struct {
	Message Message `json:"message"`
}

func GenerateAnalysis(c *gin.Context) {
	signalID := c.Param("signal_id")

	var request AnalysisRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	db := database.GetDB()
	var signal models.Signal

	// Найти сигнал
	if err := db.Where("id = ?", signalID).First(&signal).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "Signal not found"})
			return
		}
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}

	// Генерируем аналитику через DeepSeek
	analysis, err := callDeepSeek(signal, request.Language)
	if err != nil {
		c.JSON(500, gin.H{"error": fmt.Sprintf("Analysis generation failed: %v", err)})
		return
	}

	// Сохраняем аналитику в базу
	signal.Analysis = analysis

	if err := db.Save(&signal).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to save analysis"})
		return
	}

	c.JSON(200, gin.H{"analysis": analysis})
}

func callDeepSeek(signal models.Signal, language string) (string, error) {
	apiKey := os.Getenv("DEEPSEEK_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("DEEPSEEK_API_KEY not configured")
	}

	// Создаем промпт в зависимости от языка
	var prompt string
	if language == "ru" {
		prompt = createRussianPrompt(signal)
	} else {
		prompt = createEnglishPrompt(signal)
	}

	// Подготавливаем запрос к DeepSeek
	requestBody := DeepSeekRequest{
		Model: "deepseek-chat",
		Messages: []Message{
			{
				Role:    "user",
				Content: prompt,
			},
		},
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", err
	}

	// Отправляем запрос
	req, err := http.NewRequest("POST", "https://api.deepseek.com/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("DeepSeek API error: %s", string(body))
	}

	// Парсим ответ
	var response DeepSeekResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", err
	}

	if len(response.Choices) == 0 {
		return "", fmt.Errorf("no response from DeepSeek")
	}

	return response.Choices[0].Message.Content, nil
}

func createEnglishPrompt(signal models.Signal) string {
	return fmt.Sprintf(`Analyze this financial news and provide professional investment analysis:

Title: %s
Summary: %s
Sector: %s
Region: %s
Impact: %d
Confidence: %d%%

Provide analysis in English with:
1. Market Impact Assessment (100-150 words)
2. Industry Implications & Risk Factors (100-150 words)  
3. Investment Opportunities & Key Metrics (100-150 words)

Format as professional Bloomberg/Reuters style analysis.`,
		signal.Title, signal.Summary, signal.Sector, signal.Region, signal.Impact, signal.Confidence)
}

func createRussianPrompt(signal models.Signal) string {
	return fmt.Sprintf(`Проанализируйте эту финансовую новость и предоставьте профессиональный инвестиционный анализ:

Заголовок: %s
Краткое содержание: %s
Сектор: %s
Регион: %s
Влияние: %d
Достоверность: %d%%

Предоставьте анализ на русском языке:
1. Оценка влияния на рынок (100-150 слов)
2. Последствия для отрасли и факторы риска (100-150 слов)
3. Инвестиционные возможности и ключевые метрики (100-150 слов)

Оформите как профессиональный анализ в стиле Bloomberg/Reuters.`,
		signal.Title, signal.Summary, signal.Sector, signal.Region, signal.Impact, signal.Confidence)
}
