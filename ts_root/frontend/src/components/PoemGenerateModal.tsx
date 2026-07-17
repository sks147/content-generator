import { Modal } from '@mantine/core'
import { PoemGenerateForm } from './PoemGenerateForm'
import type { PoemFormValues } from './PoemGenerateForm'

interface PoemGenerateModalProps {
  opened: boolean
  onClose: () => void
  onSubmit: (values: PoemFormValues) => void
  isSubmitting: boolean
}

export function PoemGenerateModal({
  opened,
  onClose,
  onSubmit,
  isSubmitting,
}: PoemGenerateModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Generate a Poem"
      centered
      closeOnClickOutside={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <PoemGenerateForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
    </Modal>
  )
}
