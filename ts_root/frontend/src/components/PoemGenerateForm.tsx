import { Button, Select, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { POEM_LENGTHS, POEM_STYLES } from 'shared'

export interface PoemFormValues {
  theme: string
  style: string
  length: string
}

interface PoemGenerateFormProps {
  onSubmit: (values: PoemFormValues) => void
  isSubmitting: boolean
}

export function PoemGenerateForm({ onSubmit, isSubmitting }: PoemGenerateFormProps) {
  const form = useForm<PoemFormValues>({
    mode: 'controlled',
    initialValues: {
      theme: '',
      style: 'free_verse',
      length: 'medium',
    },
    validate: {
      theme: (value) => {
        const trimmed = value.trim()
        if (trimmed.length === 0) return 'Theme is required'
        if (trimmed.length > 200) return 'Theme must be 200 characters or less'
        return null
      },
    },
  })

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Theme"
          placeholder="e.g., A sunset over the ocean"
          required
          {...form.getInputProps('theme')}
        />
        <Select
          label="Style"
          data={POEM_STYLES}
          allowDeselect={false}
          {...form.getInputProps('style')}
        />
        <Select
          label="Length"
          data={POEM_LENGTHS}
          allowDeselect={false}
          {...form.getInputProps('length')}
        />
        <Button type="submit" loading={isSubmitting} fullWidth>
          Generate Poem
        </Button>
      </Stack>
    </form>
  )
}
