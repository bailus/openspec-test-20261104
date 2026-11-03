import { useAppSelector } from '@/app/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { selectScoreTallies } from '../selectors'

export function Scoreboard() {
  const tallies = useAppSelector(selectScoreTallies)

  return (
    <Card className="scoreboard" role="region" aria-labelledby="scoreboard-title">
      <CardHeader>
        <CardTitle
          id="scoreboard-title"
          className="scoreboard-title"
          role="heading"
          aria-level={2}
        >
          Score
        </CardTitle>
      </CardHeader>
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
