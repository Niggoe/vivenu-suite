import { useState } from 'react'
import styled from 'styled-components'
import TicketForm from './TicketForm'
import ResultDisplay from './ResultDisplay'
import SchalkeLogoComponent from './SchalkeLogoComponent'
import ApiConfigSelector from './ApiConfigSelector'
import CsvBatchUpload from './CsvBatchUpload'
import { VivenuApiService } from '../services/vivenuApi'
import type { TicketData, ApiResult } from '../types'

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
`

const LogoTitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`

const Title = styled.h1`
  color: #2c3e50;
  font-size: 2.5rem;
  margin: 0;
`

const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
`

const Footer = styled.footer`
  text-align: center;
  margin-top: 40px;
  padding: 20px;
  color: #7f8c8d;
  font-size: 14px;
`

const FooterContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
`

const TabContainer = styled.div`
  margin-bottom: 30px;
`

const TabHeader = styled.div`
  display: flex;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  border: 1px solid #e9ecef;
  border-bottom: none;
`

const TabButton = styled.button<{ active: boolean }>`
  flex: 1;
  background: ${props => props.active ? 'white' : 'transparent'};
  border: none;
  padding: 15px 20px;
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.active ? '#2c3e50' : '#7f8c8d'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: ${props => props.active ? 'white' : '#f1f3f4'};
    color: #2c3e50;
  }

  ${props => props.active && `
    box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
    z-index: 1;
  `}
`

const TabContent = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 0 0 8px 8px;
  padding: 30px;
  min-height: 400px;
`

const VivenuSuite = () => {
    const [result, setResult] = useState<ApiResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single')

    const handleTicketSubmit = async (ticketData: TicketData) => {
        setIsLoading(true)
        setResult(null)

        try {
            const response = await VivenuApiService.updateTicketBarcode(
                ticketData.ticketId,
                ticketData.chipUid
            )

            setResult({
                success: true,
                message: `Barcode für Ticket ${ticketData.ticketId} erfolgreich aktualisiert`,
                data: response
            })
        } catch (error) {
            setResult({
                success: false,
                message: 'Fehler beim Aktualisieren des Barcodes',
                error: error instanceof Error ? error.message : 'Unbekannter Fehler'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Container>
            <Header>
                <LogoTitleContainer>
                    <SchalkeLogoComponent size="large" />
                    <Title>Vivenu Suite</Title>
                </LogoTitleContainer>
                <Subtitle>Ticket Barcode Management System</Subtitle>
            </Header>

            <ApiConfigSelector />

            <TabContainer>
                <TabHeader>
                    <TabButton
                        active={activeTab === 'single'}
                        onClick={() => setActiveTab('single')}
                    >
                        🎫 Einzelnes Ticket
                    </TabButton>
                    <TabButton
                        active={activeTab === 'batch'}
                        onClick={() => setActiveTab('batch')}
                    >
                        📊 CSV Batch-Upload
                    </TabButton>
                </TabHeader>

                <TabContent>
                    {activeTab === 'single' ? (
                        <>
                            <TicketForm
                                onSubmit={handleTicketSubmit}
                                isLoading={isLoading}
                            />
                            {result && (
                                <div style={{ marginTop: '20px' }}>
                                    <ResultDisplay result={result} />
                                </div>
                            )}
                        </>
                    ) : (
                        <CsvBatchUpload />
                    )}
                </TabContent>
            </TabContainer>

            <Footer>
                <FooterContent>
                    <SchalkeLogoComponent size="small" />
                    <span>Powered by Schalke 04 - Königsblau seit 1904</span>
                </FooterContent>
            </Footer>
        </Container>
    )
}

export default VivenuSuite
