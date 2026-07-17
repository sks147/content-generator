import { Badge, Card, Group, Text } from '@mantine/core'
import type { Poem } from 'shared'

interface PoemCardProps {
  poem: Poem
  onClick: () => void
}

function formatStyle(style: string): string {
  return style
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PoemCard({ poem, onClick }: PoemCardProps) {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <Group justify="space-between" mb="xs">
        <Text fw={500} truncate="end" style={{ flex: 1 }}>
          {poem.theme}
        </Text>
        <Group gap="xs" wrap="nowrap">
          <Badge variant="light" color="blue">
            {formatStyle(poem.style)}
          </Badge>
          <Badge variant="light" color="gray">
            {poem.length}
          </Badge>
        </Group>
      </Group>

      <Text
        size="sm"
        style={{ whiteSpace: 'pre-wrap' }}
        lineClamp={8}
      >
        {poem.content}
      </Text>

      <Text size="xs" c="dimmed" mt="md">
        {formatDate(poem.created_at)}
      </Text>
    </Card>
  )
}
