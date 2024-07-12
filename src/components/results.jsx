function CandidatesTable(candidates, bv) {
  return (
    <table>
      <tr>
        <th>Candidat·e</th>
        <th>Nuance</th>
        <th>Nombre de voix</th>
        <th></th>
      </tr>
      {candidates.map((c) => {
        if (c.elu_1er_tour == "TRUE") {
          return (
            <tr>
              <td>{c.liste}</td>
              <td>{c.nuance}</td>
              <td colspan="2">
                Élu·e au 1<sup>er</sup> tour
              </td>
            </tr>
          );
        } else {
          return (
            <tr>
              <td>{c.liste}</td>
              <td>{c.nuance}</td>
              <td>{c.nbVoix}</td>
              <td>{Math.round((c.nbVoix / bv?.exprimes) * 1000) / 10} %</td>
            </tr>
          );
        }
      })}
    </table>
  );
}

export default function Results({ infos }) {
  if (!infos.commune) {
    return "Cliquez sur un bureau de vote pour consulter ses résultats.";
  } else {
    return (
      <div>
        <strong>{infos.commune?.nomCommune}</strong>
        <br />
        {infos.bv != null ? (
          <div>
            {infos?.bv?.nomCirco || ""}
            <br />
            {infos?.bv?.numeroBureauVote
              ? `Bureau nº ${infos.bv.numeroBureauVote?.replace(/^0+/, "")}`
              : ""}
            <br />
            Inscrits : {infos?.bv?.inscrits}
            <br />
            Exprimés :{" "}
            {Math.round((infos?.bv?.exprimes / infos?.bv?.inscrits) * 1000) /
              10}
             % <br />
            Abstention :{" "}
            {Math.round((infos?.bv?.abstentions / infos?.bv?.inscrits) * 1000) /
              10}
             %
          </div>
        ) : (
          <div>
            {!infos.candidates?.length ? (
              "Informations non disponibles"
            ) : (
              <span>
                Pas d’élection ; candidat·e élu·e au 1<sup>er</sup> tour
              </span>
            )}
          </div>
        )}
        {infos.candidates != null
          ? CandidatesTable(infos.candidates, infos.bv)
          : null}
      </div>
    );
  }
}
