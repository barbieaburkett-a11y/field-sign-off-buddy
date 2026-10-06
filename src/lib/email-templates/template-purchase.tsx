import React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props { packNames?: string; accessUrl?: string }

const Email = ({ packNames, accessUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your FieldCO templates are ready to download</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your templates are ready</Heading>
        <Text style={text}>Thanks for your purchase{packNames ? ` of ${packNames}` : ''}. Open your templates any time with the button below — print them or save them as PDF.</Text>
        {accessUrl ? <Button href={accessUrl} style={button}>Open my templates</Button> : null}
        <Text style={muted}>Keep this email — the link is your personal access to these templates.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Your FieldCO templates are ready',
  displayName: 'Template purchase delivery',
  previewData: { packNames: 'Electrical Template Pack', accessUrl: 'https://approvefield.app/templates' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { color: '#1a241f', fontSize: '22px', margin: '0 0 16px' }
const text = { color: '#2d3a33', fontSize: '15px', lineHeight: '1.6', margin: '0 0 14px' }
const muted = { color: '#5c6e64', fontSize: '13px', margin: '20px 0 0' }
const button = { backgroundColor: '#d48347', color: '#1a241f', padding: '12px 20px', borderRadius: '8px', fontSize: '15px', textDecoration: 'none' }
