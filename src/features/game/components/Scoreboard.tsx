import { useAppSelector } from '@/app/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { selectScore } from '../selectors'

export function Scoreboard() {
  const score = useAppSelector(selectScore)
  const tallies = [
    { key: 'x', label: 'X wins', value: score.X },
    { key: 'o', label: 'O wins', value: score.O },
    { key: 'draws', label: 'Draws', value: score.draws },
  ]

  return (
    <Card className="scoreboard" role="region" aria-labelledby="scoreboard-title">
      <CardHeader>
        <CardTitle id="scoreboard-title" role="heading" aria-level={2}>
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
