import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import styled from 'styled-components'
import type { TicketData } from '../types'
import { uidToId, isValidChipUid } from '../utils/chipUtils'

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
`

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3498db;
  }

  &:invalid {
    border-color: #e74c3c;
  }
`

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
`

const Button = styled.button<{ disabled?: boolean }>`
  background: ${props => props.disabled ? '#bdc3c7' : '#3498db'};
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.disabled ? '#bdc3c7' : '#2980b9'};
  }
`

const HelpText = styled.small`
  color: #7f8c8d;
  font-size: 12px;
  margin-top: 4px;
`

const ConversionPreview = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
`

const ConversionLabel = styled.div`
  color: #495057;
  font-weight: 600;
  margin-bottom: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`

const ConversionValue = styled.div<{ $isValid?: boolean }>`
  color: ${props => props.$isValid ? '#28a745' : '#6c757d'};
  word-break: break-all;
`

interface TicketFormProps {
    onSubmit: (data: TicketData) => void
    isLoading: boolean
}

const TicketForm: React.FC<TicketFormProps> = ({ onSubmit, isLoading }) => {
    const [chipUidWatch, setChipUidWatch] = useState('')

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset
    } = useForm<TicketData>()

    // Watch chip UID für Live-Vorschau
    const watchedChipUid = watch('chipUid', '')

    useEffect(() => {
        setChipUidWatch(watchedChipUid)
    }, [watchedChipUid])

    // Berechne konvertierten Barcode
    const getConvertedBarcode = (uid: string): { isValid: boolean; converted?: string; error?: string } => {
        if (!uid || uid.length === 0) {
            return { isValid: false }
        }

        try {
            if (isValidChipUid(uid)) {
                const converted = uidToId(uid)
                return { isValid: true, converted }
            } else {
                return { isValid: false, error: 'Ungültige UID (benötigt 8 HEX-Zeichen)' }
            }
        } catch (error) {
            return { isValid: false, error: error instanceof Error ? error.message : 'Konvertierungsfehler' }
        }
    }

    const conversionResult = getConvertedBarcode(chipUidWatch)

    const onSubmitHandler: SubmitHandler<TicketData> = (data) => {
        onSubmit(data)
        reset()
    }

    return (
        <Form onSubmit={handleSubmit(onSubmitHandler)}>
            <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>
                Ticket Barcode aktualisieren
            </h2>

            <FormGroup>
                <Label htmlFor="ticketId">Ticket ID</Label>
                <Input
                    {...register('ticketId', {
                        required: 'Ticket ID ist erforderlich',
                        pattern: {
                            value: /^[A-Za-z0-9-_]+$/,
                            message: 'Ticket ID darf nur Buchstaben, Zahlen, Bindestriche und Unterstriche enthalten'
                        }
                    })}
                    id="ticketId"
                    type="text"
                    placeholder="z.B. TCK-12345-ABC"
                    disabled={isLoading}
                />
                {errors.ticketId && (
                    <ErrorMessage>{errors.ticketId.message}</ErrorMessage>
                )}
                <HelpText>
                    Geben Sie die eindeutige Ticket-ID ein
                </HelpText>
            </FormGroup>

            <FormGroup>
                <Label htmlFor="chipUid">Chip UID (HEX)</Label>
                <Input
                    {...register('chipUid', {
                        required: 'Chip UID ist erforderlich',
                        validate: {
                            validHex: (value) => {
                                if (!isValidChipUid(value)) {
                                    return 'Chip UID muss ein gültiger 8-stelliger HEX-Code sein (z.B. c43f3632)'
                                }
                                return true
                            }
                        }
                    })}
                    id="chipUid"
                    type="text"
                    placeholder="z.B. c43f3632"
                    disabled={isLoading}
                    style={{ textTransform: 'lowercase', fontFamily: 'monospace' }}
                />
                {errors.chipUid && (
                    <ErrorMessage>{errors.chipUid.message}</ErrorMessage>
                )}
                <HelpText>
                    Geben Sie die 8-stellige UID des Chips als HEX-Code ein
                </HelpText>

                {/* Live-Konvertierungsvorschau */}
                {watchedChipUid && (
                    <ConversionPreview>
                        <ConversionLabel>Konvertierter Barcode (Vorschau):</ConversionLabel>
                        {conversionResult.isValid ? (
                            <ConversionValue $isValid={true}>
                                {conversionResult.converted}
                            </ConversionValue>
                        ) : (
                            <ConversionValue $isValid={false}>
                                {conversionResult.error || 'Geben Sie eine gültige 8-stellige HEX-UID ein'}
                            </ConversionValue>
                        )}
                    </ConversionPreview>
                )}
            </FormGroup>

            <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Wird verarbeitet...' : 'Barcode aktualisieren'}
            </Button>
        </Form>
    )
}

export default TicketForm
