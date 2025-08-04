import React from 'react'
import styled from 'styled-components'
import type { ApiResult } from '../types'

const ResultContainer = styled.div<{ success: boolean }>`
  padding: 20px;
  border-radius: 8px;
  background: ${props => props.success ? '#d4edda' : '#f8d7da'};
  border: 1px solid ${props => props.success ? '#c3e6cb' : '#f5c6cb'};
`

const ResultTitle = styled.h3<{ success: boolean }>`
  margin: 0 0 10px 0;
  color: ${props => props.success ? '#155724' : '#721c24'};
  display: flex;
  align-items: center;
  gap: 10px;
`

const ResultMessage = styled.p`
  margin: 0 0 10px 0;
  font-size: 16px;
`

const ErrorDetails = styled.details`
  margin-top: 15px;
`

const ErrorSummary = styled.summary`
  cursor: pointer;
  font-weight: 600;
  color: #721c24;
  
  &:hover {
    text-decoration: underline;
  }
`

const ErrorText = styled.pre`
  background: rgba(0, 0, 0, 0.05);
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0 0 0;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
`

const DataDisplay = styled.div`
  background: rgba(0, 0, 0, 0.05);
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
`

const DataTitle = styled.h4`
  margin: 0 0 10px 0;
  color: #155724;
`

const DataContent = styled.pre`
  margin: 0;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
`

const Icon = styled.span`
  font-size: 20px;
`

interface ResultDisplayProps {
  result: ApiResult
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  return (
    <ResultContainer success={result.success}>
      <ResultTitle success={result.success}>
        <Icon>{result.success ? '✅' : '❌'}</Icon>
        {result.success ? 'Erfolgreich' : 'Fehler'}
      </ResultTitle>

      <ResultMessage>{result.message}</ResultMessage>

      {result.success && result.data && (
        <DataDisplay>
          <DataTitle>API Response:</DataTitle>
          <DataContent>
            {JSON.stringify(result.data, null, 2)}
          </DataContent>
        </DataDisplay>
      )}

      {!result.success && result.error && (
        <ErrorDetails>
          <ErrorSummary>Fehlerdetails anzeigen</ErrorSummary>
          <ErrorText>{result.error}</ErrorText>
        </ErrorDetails>
      )}
    </ResultContainer>
  )
}

export default ResultDisplay
