package models

type Signal struct {
	ID           string  `json:"id" gorm:"primaryKey"`
	TsPublished  string  `json:"ts_published"`
	TsIngested   string  `json:"ts_ingested"`
	SourceDomain string  `json:"source_domain"`
	URL          string  `json:"url"`
	Title        string  `json:"title"`
	TitleClean   string  `json:"title_clean"`
	TitleRu      string  `json:"title_ru"`
	Sector       string  `json:"sector"`
	Label        string  `json:"label"`
	Region       string  `json:"region"`
	EntitiesJSON string  `json:"entities_json"`
	TickersJSON  string  `json:"tickers_json"`
	Impact       int     `json:"impact"`
	Confidence   int     `json:"confidence"`
	Sentiment    int     `json:"sentiment"`
	TrustScore   float64 `json:"trust_score"`
	IsTest       bool    `json:"is_test"`
	Summary      string  `json:"summary"`
	Analysis     string  `json:"analysis"`
	Latency      string  `json:"latency"`
}

type Curation struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	SignalID string `json:"signal_id" gorm:"index"`
	Starred  bool   `json:"starred"`
	Note     string `json:"note"`
	Tags     string `json:"tags"`
}
