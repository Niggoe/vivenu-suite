import React, { useState } from 'react'
import styled from 'styled-components'
import { API_CONFIGS, getCurrentConfig, setCurrentConfig } from '../services/apiConfig'
import type { ApiConfig } from '../services/apiConfig'

const ConfigContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
`

const ConfigHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
`

const ConfigTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
`

const CurrentConfigBadge = styled.div<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
`

const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
`

const ConfigCard = styled.div<{ $isActive: boolean; $color: string }>`
  border: 2px solid ${props => props.$isActive ? props.$color : '#e1e8ed'};
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$isActive ? `${props.$color}08` : 'white'};

  &:hover {
    border-color: ${props => props.$color};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`

const ConfigName = styled.div<{ $color: string }>`
  font-weight: bold;
  color: ${props => props.$color};
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const ConfigDescription = styled.div`
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 10px;
`

const ConfigDetails = styled.div`
  font-size: 12px;
  color: #95a5a6;
`

const ConfigUrl = styled.div`
  font-family: monospace;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 5px;
  word-break: break-all;
`

const ApiKeyStatus = styled.span<{ $hasKey: boolean }>`
  color: ${props => props.$hasKey ? '#27ae60' : '#e74c3c'};
  font-weight: bold;
`

const WarningBox = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 12px;
  margin-top: 15px;
  color: #856404;
  font-size: 14px;
`

const ApiConfigSelector: React.FC = () => {
    const [currentConfig] = useState<ApiConfig>(getCurrentConfig())
    const [selectedConfig, setSelectedConfig] = useState<string>(
        localStorage.getItem('vivenu-api-config') || 'mock'
    )

    const handleConfigChange = (configName: string) => {
        if (configName === 'live') {
            const confirmed = window.confirm(
                '⚠️ WARNUNG: Sie wechseln zur LIVE/PRODUCTION API!\n\n' +
                'Dies führt zu echten API-Calls auf dem Production-System.\n' +
                'Sind Sie sicher, dass Sie fortfahren möchten?'
            )
            if (!confirmed) return
        }

        setSelectedConfig(configName)
        setCurrentConfig(configName)
    }

    const getStatusIcon = (configName: string) => {
        if (configName === 'mock') return '🧪'
        if (configName === 'dev') return '🔧'
        if (configName === 'staging') return '🚧'
        if (configName === 'live') return '🚨'
        return '⚙️'
    }

    return (
        <ConfigContainer>
            <ConfigHeader>
                <ConfigTitle>🔧 API-Konfiguration</ConfigTitle>
                <CurrentConfigBadge color={currentConfig.color}>
                    {currentConfig.name}
                </CurrentConfigBadge>
            </ConfigHeader>

            <ConfigGrid>
                {Object.entries(API_CONFIGS).map(([key, config]) => (
                    <ConfigCard
                        key={key}
                        $isActive={selectedConfig === key}
                        $color={config.color}
                        onClick={() => handleConfigChange(key)}
                    >
                        <ConfigName $color={config.color}>
                            {getStatusIcon(key)} {config.name}
                        </ConfigName>

                        <ConfigDescription>
                            {config.description}
                        </ConfigDescription>

                        <ConfigDetails>
                            <div>
                                <strong>API Key:</strong>{' '}
                                <ApiKeyStatus $hasKey={!!config.apiKey}>
                                    {config.apiKey ? 'Konfiguriert ✅' : 'Nicht gesetzt ❌'}
                                </ApiKeyStatus>
                            </div>

                            <ConfigUrl>
                                {config.apiUrl}
                            </ConfigUrl>
                        </ConfigDetails>
                    </ConfigCard>
                ))}
            </ConfigGrid>

            {selectedConfig === 'live' && (
                <WarningBox>
                    <strong>⚠️ LIVE/PRODUCTION Modus aktiv!</strong><br />
                    Alle API-Calls werden an das echte Production-System gesendet.
                    Seien Sie vorsichtig mit Ihren Aktionen!
                </WarningBox>
            )}

            {selectedConfig !== 'mock' && !API_CONFIGS[selectedConfig]?.apiKey && (
                <WarningBox>
                    <strong>⚠️ Kein API-Key konfiguriert!</strong><br />
                    Setzen Sie den entsprechenden API-Key in der .env Datei,
                    um echte API-Calls durchzuführen.
                </WarningBox>
            )}
        </ConfigContainer>
    )
}

export default ApiConfigSelector
