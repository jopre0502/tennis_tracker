import packageJson from '../../package.json';

const InfoScreen = ({ onClose }) => {
  return (
    <div className="min-h-screen bg-green-900 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-4 text-green-800">Statistik-Erklärungen</h1>

        <div className="space-y-4 text-sm">
          <div className="border-b pb-3">
            <h2 className="font-bold text-green-700 mb-1">Trainer-Metriken</h2>

            <div className="mt-2">
              <h3 className="font-semibold">Unerzw. Fehler (Unforced Errors)</h3>
              <p className="text-gray-700">Fehler, die ohne Druck vom Gegner gemacht wurden. Der Spieler hätte den Ball eigentlich spielen können.</p>
              <p className="text-xs text-gray-600 mt-1">Ziel: &lt;30% der Gesamtpunkte</p>
              <p className="text-xs text-gray-500">Grün ≤20% | Gelb 21-30% | Rot &gt;30%</p>
            </div>

            <div className="mt-2">
              <h3 className="font-semibold">Winner:Unerzw. Fehler</h3>
              <p className="text-gray-700">Verhältnis von gewonnenen Punkten durch Winner zu selbst verschuldeten Fehlern.</p>
              <p className="text-xs text-gray-600 mt-1">Ziel: ≥1:1 (mindestens so viele Winner wie UE)</p>
              <p className="text-xs text-gray-500">Grün ≥1:1 | Gelb 0.8-1.0 | Rot &lt;0.8</p>
            </div>

            <div className="mt-2">
              <h3 className="font-semibold">Aggressivitäts-Saldo</h3>
              <p className="text-gray-700">Zeigt, ob der Spieler "positiv aggressiv" spielt.</p>
              <p className="text-xs text-gray-600 mt-1">Formel: (Winner + Erzw. Fehler) - Unerzw. Fehler</p>
              <p className="text-xs text-gray-600 mt-1">Ziel: &gt;0 (positive Bilanz)</p>
              <p className="text-xs text-gray-500">Grün ≥3 | Gelb 0-2 | Rot &lt;0</p>
            </div>

            <div className="mt-2">
              <h3 className="font-semibold">Punkte verloren durch Fehler</h3>
              <p className="text-gray-700">Anteil der verlorenen Punkte, die durch eigene Fehler (Doppelfehler, Erzw. + Unerzw. Fehler) entstanden sind.</p>
            </div>
          </div>

          <div className="border-b pb-3">
            <h2 className="font-bold text-green-700 mb-1">Aufschlag-Statistiken</h2>

            <div className="mt-2">
              <h3 className="font-semibold">1. Aufschlag Quote</h3>
              <p className="text-gray-700">Prozentsatz der ersten Aufschläge, die ins Feld gingen.</p>
              <p className="text-xs text-gray-600 mt-1">Bezogen auf: eigene Aufschlagpunkte</p>
            </div>

            <div className="mt-2">
              <h3 className="font-semibold">1. Aufschlag gewonnen</h3>
              <p className="text-gray-700">Prozentsatz der Punkte, die nach erfolgreichem ersten Aufschlag gewonnen wurden.</p>
            </div>

            <div className="mt-2">
              <h3 className="font-semibold">2. Aufschlag Quote / gewonnen</h3>
              <p className="text-gray-700">Analog zum ersten Aufschlag, aber für den zweiten Aufschlag.</p>
            </div>

            <div className="mt-2">
              <h3 className="font-semibold">Aufschlagpunkte gewonnen</h3>
              <p className="text-gray-700">Prozentsatz aller Aufschlagpunkte, die gewonnen wurden.</p>
            </div>

            <div className="mt-2">
              <h3 className="font-semibold">Returnpunkte gewonnen</h3>
              <p className="text-gray-700">Prozentsatz der Returnpunkte (wenn Gegner aufschlägt), die gewonnen wurden.</p>
            </div>
          </div>

          <div className="border-b pb-3">
            <h2 className="font-bold text-green-700 mb-1">Punkttypen</h2>

            <div className="mt-2">
              <h3 className="font-semibold">Ass (Ace)</h3>
              <p className="text-gray-700">Aufschlag, den der Gegner nicht berühren konnte.</p>
            </div>

            <div className="mt-2">
              <h3 className="font-semibold">Winner</h3>
              <p className="text-gray-700">Schlag im Rally, den der Gegner nicht mehr erreichen konnte.</p>
            </div>

            <div className="mt-2">
              <h3 className="font-semibold">Doppelfehler</h3>
              <p className="text-gray-700">Beide Aufschläge gingen ins Netz oder ins Aus.</p>
            </div>

            <div className="mt-2">
              <h3 className="font-semibold">Erzw. Fehler (Forced Error)</h3>
              <p className="text-gray-700">Fehler des Gegners, der durch Druck erzwungen wurde.</p>
            </div>
          </div>

          <div className="pb-3">
            <h2 className="font-bold text-green-700 mb-1">Hinweis</h2>
            <p className="text-xs text-gray-600">Bei Aufschlag/Return: Prozente bezogen auf eigene Aufschlag- bzw. Returnpunkte</p>
            <p className="text-xs text-gray-600">Alle anderen Statistiken: Prozente bezogen auf Gesamtpunkte des Matches</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 p-4 bg-green-600 text-white rounded-lg font-bold focus:ring-4 focus:ring-green-400 focus:outline-none hover:bg-green-700"
          aria-label="Statistik-Erklärungen schließen und zurück zum Match"
        >
          Zurück
        </button>

        <div className="text-center mt-4 text-xs text-gray-500">
          v{packageJson.version}
        </div>
      </div>
    </div>
  );
};

export default InfoScreen;
