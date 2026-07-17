import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import { Button, Container, Group, Notification, Stack, Title } from '@mantine/core'
import type { Poem } from 'shared'
import { PoemGrid } from '../components/PoemGrid'
import { PoemDetailModal } from '../components/PoemDetailModal'
import { PoemGenerateModal } from '../components/PoemGenerateModal'
import type { PoemFormValues } from '../components/PoemGenerateForm'
import { createPoem, fetchPoems } from '../api/poems'
import { ApiRequestError } from '../api/client'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [poems, setPoems] = useState<Poem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false)
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null)
  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false)

  const loadPoems = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const result = await fetchPoems()
      setPoems(result.poems)
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? 'Failed to load poems'
          : 'Network error'
      setFetchError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPoems()
  }, [loadPoems])

  const handleGenerate = useCallback(
    async (values: PoemFormValues) => {
      setIsSubmitting(true)
      setSubmitError(null)
      try {
        const newPoem = await createPoem(values)
        setPoems((prev) => [newPoem, ...prev])
        closeModal()
      } catch (err) {
        const message =
          err instanceof ApiRequestError
            ? 'Poem generation failed. Please try again.'
            : 'Network error'
        setSubmitError(message)
      } finally {
        setIsSubmitting(false)
      }
    },
    [closeModal],
  )

  return (
    <Container size="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>Poems</Title>
          <Button onClick={openModal}>Generate Poem</Button>
        </Group>

        {submitError && (
          <Notification color="red" onClose={() => setSubmitError(null)}>
            {submitError}
          </Notification>
        )}

        <PoemGrid
          poems={poems}
          isLoading={isLoading}
          error={fetchError}
          onPoemClick={(poem) => {
            setSelectedPoem(poem)
            openDetail()
          }}
        />

        <PoemDetailModal
          poem={selectedPoem}
          opened={detailOpened}
          onClose={closeDetail}
        />

        <PoemGenerateModal
          opened={modalOpened}
          onClose={closeModal}
          onSubmit={handleGenerate}
          isSubmitting={isSubmitting}
        />
      </Stack>
    </Container>
  )
}
