import { Alert, Center, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core'
import type { Poem } from 'shared'
import { PoemCard } from './PoemCard'

interface PoemGridProps {
  poems: Poem[]
  isLoading: boolean
  error: string | null
  onPoemClick: (poem: Poem) => void
}

export function PoemGrid({ poems, isLoading, error, onPoemClick }: PoemGridProps) {
  if (error) {
    return (
      <Alert color="red" title="Error">
        {error}
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} height={200} radius="md" />
        ))}
      </SimpleGrid>
    )
  }

  const hasPoems = poems.length > 0
  if (!hasPoems) {
    return (
      <Center h={200}>
        <Stack align="center" gap="xs">
          <Text size="lg" c="dimmed">
            No poems yet
          </Text>
          <Text size="sm" c="dimmed">
            Generate your first poem to get started
          </Text>
        </Stack>
      </Center>
    )
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
      {poems.map((poem) => (
        <PoemCard key={poem.id} poem={poem} onClick={() => onPoemClick(poem)} />
      ))}
    </SimpleGrid>
  )
}
