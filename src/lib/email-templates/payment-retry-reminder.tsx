import React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  companyName?: string
  retryDate?: string
  graceEndDate?: string
  billingUrl?: string
}

const Email = ({ companyName, retryDate, graceEndDate, billingUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We'll try your card again {retryDate ?? 'tomorrow'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Heads up: payment retry tomorrow</Heading>
        <Text style={text}>{companyName ? `Hi ${companyName},` : 'Hi there,'}</Text>
        <Text style={text}>
          Your last FieldCO subscription payment didn't go through. We'll automatically try your card
          again on <strong>{retryDate ?? 'tomorrow'}</strong>.
        </Text>
        <Text style={text}>
          If your card has changed or expired, update it before then so your paid features stay on
          {graceEndDate ? ` (they're protected until ${graceEndDate})` : ''}.
        </Text>
        {billingUrl ? (
          <Button href={billingUrl} style={button}>Open FieldCO to update payment</Button>
        ) : null}
        <Text style={muted}>Already fixed it? You can ignore this message.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Payment retry on ${d['retryDate'] ?? 'tomorrow'} — update your card if needed`,
  displayName: 'Payment retry reminder',
  previewData: {
    companyName: 'Burkett Drywall',
    retryDate: 'October 2, 2026',
    graceEndDate: 'October 7, 2026',
    billingUrl: 'https://approvefield.app/pricing',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { color: '#3a2e26', fontSize: '22px', margin: '0 0 16px' }
const text = { color: '#3a2e26', fontSize: '15px', lineHeight: '1.6', margin: '0 0 14px' }
const muted = { color: '#7a6d62', fontSize: '13px', margin: '20px 0 0' }
const button = {
  backgroundColor: '#b85c38',
  color: '#ffffff',
  padding: '12px 20px',
  borderRadius: '8px',
  fontSize: '15px',
  textDecoration: 'none',
}
