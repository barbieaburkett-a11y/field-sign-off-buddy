import React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  number?: string
  title?: string
  jobName?: string
  amount?: string
  detailUrl?: string
}

const Email = ({ number, title, jobName, amount, detailUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{number ?? 'A change directive'} is still waiting for the GC's signature</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Still unsigned after 24 hours</Heading>
        <Text style={text}>
          <strong>{number} – {title}</strong>{jobName ? ` on ${jobName}` : ''}{amount ? ` (${amount})` : ''} was sent for approval a day ago and hasn't been signed yet.
        </Text>
        <Text style={text}>A quick follow-up text or call to the superintendent usually does it — before the work gets built.</Text>
        {detailUrl ? <Button href={detailUrl} style={button}>Open the directive</Button> : null}
        <Text style={muted}>You'll get one reminder per directive.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `${d['number'] ?? 'Change directive'} still needs the GC's signature`,
  displayName: 'Unsigned directive reminder',
  previewData: { number: 'CD-0007', title: 'Reroute conduit around new duct', jobName: 'Riverside Medical', amount: '$1,850.00', detailUrl: 'https://approvefield.app/' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { color: '#3a2e26', fontSize: '22px', margin: '0 0 16px' }
const text = { color: '#3a2e26', fontSize: '15px', lineHeight: '1.6', margin: '0 0 14px' }
const muted = { color: '#7a6d62', fontSize: '13px', margin: '20px 0 0' }
const button = { backgroundColor: '#b85c38', color: '#ffffff', padding: '12px 20px', borderRadius: '8px', fontSize: '15px', textDecoration: 'none' }
