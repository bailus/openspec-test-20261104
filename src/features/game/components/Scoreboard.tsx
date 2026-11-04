import { useAppSelector } from '@/app/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { selectScoreTallies } from '../selectors'

export function Scoreboard() {
  const tallies = useAppSelector(selectScoreTallies)

  return (
    // No visible heading; the region keeps the name "Score" for screen readers.
    <Card className="scoreboard" role="region" aria-label="Score">
      <CardContent>
        <dl className="tallies">
          {tallies.map((t) => (
            <div key={t.key} className="tally" data-testid={`tally-${t.key}`}>
              <dt>{t.label}</dt>
              <dd>{t.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
