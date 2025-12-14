import { createSignal } from 'solid-js'
import { ProseMirrorEditor } from './components/ProseMirrorEditor'
import { ThemeComparison } from '../../story-utils/ThemeComparison'
import type { Paragraph } from '@story/shared'
import shortUUID from 'short-uuid'

// Sample paragraphs for the demo
const createSampleParagraphs = (): Paragraph[] => [
  {
    id: shortUUID.generate(),
    body: 'The morning sun cast long shadows across the cobblestone streets of the old town. Maria walked slowly, her footsteps echoing in the quiet.',
    state: 'final',
    comments: [],
  },
  {
    id: shortUUID.generate(),
    body: 'She paused at the corner, glancing back at the café where they had first met. The memories came flooding back, bittersweet and vivid.',
    state: 'draft',
    comments: [],
  },
  {
    id: shortUUID.generate(),
    body: '"I should have said something," she whispered to herself. But the moment had passed, like so many others before it.',
    state: 'revise',
    comments: [],
  },
]

export default (props: { Hst: any }) => {
  const { Hst } = props

  return (
    <Hst.Story title="ProseMirrorEditor" group="editor">
      <Hst.Variant title="Basic Editor">
        <ThemeComparison>
          {(() => {
            const [paragraphs, setParagraphs] = createSignal<Paragraph[]>(createSampleParagraphs())

            const handleParagraphsChange = (newParagraphs: Paragraph[], changedIds: string[]) => {
              setParagraphs(newParagraphs)
            }

            const handleParagraphCreate = (paragraph: Omit<Paragraph, 'id'>, afterId?: string): string => {
              const newId = shortUUID.generate()
              const newParagraph = { ...paragraph, id: newId }

              setParagraphs(prev => {
                if (afterId) {
                  const index = prev.findIndex(p => p.id === afterId)
                  if (index !== -1) {
                    return [...prev.slice(0, index + 1), newParagraph, ...prev.slice(index + 1)]
                  }
                }
                return [...prev, newParagraph]
              })

              return newId
            }

            const handleParagraphDelete = (paragraphId: string) => {
              setParagraphs(prev => prev.filter(p => p.id !== paragraphId))
            }

            return (
              <div style={{ padding: '1rem' }}>
                <ProseMirrorEditor
                  paragraphs={paragraphs()}
                  onParagraphsChange={handleParagraphsChange}
                  onParagraphCreate={handleParagraphCreate}
                  onParagraphDelete={handleParagraphDelete}
                  isProtagonistSet={true}
                />
              </div>
            )
          })()}
        </ThemeComparison>
      </Hst.Variant>

      <Hst.Variant title="Paragraph States">
        <ThemeComparison>
          {(() => {
            const states: Array<Paragraph['state']> = ['draft', 'revise', 'ai', 'final', 'sdt']
            const [paragraphs] = createSignal<Paragraph[]>(
              states.map((state, i) => ({
                id: shortUUID.generate(),
                body: `This paragraph has the "${state}" state. Click on it to see the action menu.`,
                state,
                comments: [],
              }))
            )

            return (
              <div style={{ padding: '1rem' }}>
                <p style={{ 'margin-bottom': '1rem', 'font-size': '0.875rem', color: 'var(--color-text-secondary)' }}>
                  Paragraph states are indicated by the left border color:
                  Draft (yellow), Revise (red), AI (purple), Final (green), SDT (blue)
                </p>
                <ProseMirrorEditor
                  paragraphs={paragraphs()}
                  onParagraphsChange={() => {}}
                  onParagraphCreate={() => ''}
                  onParagraphDelete={() => {}}
                  isProtagonistSet={true}
                />
              </div>
            )
          })()}
        </ThemeComparison>
      </Hst.Variant>

      <Hst.Variant title="Empty Editor">
        <ThemeComparison>
          {(() => {
            const [paragraphs, setParagraphs] = createSignal<Paragraph[]>([
              {
                id: shortUUID.generate(),
                body: '',
                state: 'draft',
                comments: [],
              }
            ])

            return (
              <div style={{ padding: '1rem' }}>
                <p style={{ 'margin-bottom': '1rem', 'font-size': '0.875rem', color: 'var(--color-text-secondary)' }}>
                  Empty paragraphs show a placeholder. Try typing something!
                </p>
                <ProseMirrorEditor
                  paragraphs={paragraphs()}
                  onParagraphsChange={(p) => setParagraphs(p)}
                  onParagraphCreate={() => shortUUID.generate()}
                  onParagraphDelete={() => {}}
                  isProtagonistSet={false}
                />
              </div>
            )
          })()}
        </ThemeComparison>
      </Hst.Variant>
    </Hst.Story>
  )
}
