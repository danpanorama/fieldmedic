import { Badge, Button, Notice } from '../components/ui';
import { DEMO_MEDIC_ID } from '../config';
import { OpenMatchesList, useOpenMatches } from '../features/matches';

// Pages stay thin: they compose features and handle loading/error states.
export function OpenMatchesPage() {
  const { data, isPending, isError, refetch } = useOpenMatches(DEMO_MEDIC_ID);

  return (
    <div className="mx-auto min-h-dvh max-w-lg">
      <header className="bg-white px-4 pt-8 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            {data && <p className="text-sm text-muted">שלום, {data.medic.firstName}</p>}
            <h1 className="text-2xl font-extrabold">משחקים פתוחים</h1>
          </div>
          {data &&
            (data.medic.licenseValid ? (
              <Badge tone="success">✓ רישיון בתוקף</Badge>
            ) : (
              <Badge tone="danger">רישיון לא בתוקף</Badge>
            ))}
        </div>
      </header>

      <main className="px-4 py-6">
        {isPending && <p className="py-12 text-center text-muted">טוען משחקים…</p>}

        {isError && (
          <div className="space-y-3">
            <Notice tone="danger">לא הצלחנו לטעון את המשחקים. בדקו את החיבור ונסו שוב.</Notice>
            <Button variant="outline" onClick={() => void refetch()}>
              נסו שוב
            </Button>
          </div>
        )}

        {data && (
          <OpenMatchesList matches={data.matches} canTakeMatches={data.medic.licenseValid} />
        )}
      </main>
    </div>
  );
}
