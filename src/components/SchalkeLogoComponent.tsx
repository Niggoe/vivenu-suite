import React from 'react'
import styled, { keyframes } from 'styled-components'
import SchalkeLogoOfficial from '../assets/FC_Schalke_04_Logo.svg.png'

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`

const LogoContainer = styled.div<{ size?: 'small' | 'medium' | 'large' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => {
        switch (props.size) {
            case 'small': return '40px'
            case 'large': return '100px'
            default: return '60px'
        }
    }};
  height: ${props => {
        switch (props.size) {
            case 'small': return '40px'
            case 'large': return '100px'
            default: return '60px'
        }
    }};
  
  &:hover {
    animation: ${pulse} 1s ease-in-out infinite;
  }
`

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 75, 135, 0.3));
`

const SchalkeText = styled.span`
  margin-left: 12px;
  font-weight: bold;
  font-size: 18px;
  background: linear-gradient(135deg, #004B87, #0066CC);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

interface SchalkeLogoProps {
    size?: 'small' | 'medium' | 'large'
    showText?: boolean
    className?: string
}

const SchalkeLogoComponent: React.FC<SchalkeLogoProps> = ({
    size = 'medium',
    showText = false,
    className
}) => {
    return (
        <div className={className} style={{ display: 'flex', alignItems: 'center' }}>
            <LogoContainer size={size}>
                <LogoImage
                    src={SchalkeLogoOfficial}
                    alt="FC Schalke 04 Logo"
                    title="FC Schalke 04 - Königsblau"
                />
            </LogoContainer>
            {showText && <SchalkeText>Schalke 04</SchalkeText>}
        </div>
    )
}

export default SchalkeLogoComponent
