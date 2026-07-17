import { Badge, Group, Modal, Text } from '@mantine/core'
import type { Poem } from 'shared'

interface PoemDetailModalProps {
  poem: Poem | null
  opened: boolean
  onClose: () => void
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

export function PoemDetailModal({ poem, opened, onClose }: PoemDetailModalProps) {
  if (!poem) return null

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={poem.theme}
      centered
      size="lg"
    >
      <Group gap="xs" mb="md">
        <Badge variant="light" color="blue">
          {formatStyle(poem.style)}
        </Badge>
        <Badge variant="light" color="gray">
          {poem.length}
        </Badge>
      </Group>

      <Text style={{ whiteSpace: 'pre-wrap' }}>{poem.content}</Text>

      <Text size="xs" c="dimmed" mt="lg">
        {formatDate(poem.created_at)}
      </Text>
    </Modal>
  )
}
