package config

import (
	"embed"
)

var (
	//go:embed postgres/*
	//go:embed prometheus/default.yml.gotmpl
	fs embed.FS

	PgsqlConfig                     []byte
	PrometheusDefaultConfigTemplate []byte
	CodeIntelConfig                 []byte
	CodeInsightsConfig              []byte
)

func init() {
	CodeIntelConfig, _ = fs.ReadFile("postgres/codeintel.conf")
	CodeInsightsConfig, _ = fs.ReadFile("postgres/codeinsights.conf")
	PgsqlConfig, _ = fs.ReadFile("postgres/pgsql.conf")
	PrometheusDefaultConfigTemplate, _ = fs.ReadFile("prometheus/default.yml.gotmpl")
}
