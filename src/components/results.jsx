export default function Results({ infos }) {
  if (infos?.commune) {
    return (
      <div>
        <strong>
          {infos.commune?.nomCommune} ({infos?.commune?.codeCommune})
        </strong>
        <br />
        {infos.bv != null ? 
              <div>
                {infos?.bv?.nomCirco || ""}
                <br />
                Bureau {infos?.bv?.numeroBureauVote}
                <br />
                Inscrits : {infos?.bv?.inscrits}
                <br />
                Exprimés :{" "}
                {Math.round((infos?.bv?.exprimes / infos?.bv?.inscrits) * 1000) /
                  10} % <br />
                Abstention : {Math.round(
                  (infos?.bv?.abstentions / infos?.bv?.inscrits) * 1000
                ) / 10} %
                <table>
                  <tr>
                    <th>Candidat·e</th>
                    <th>Nuance</th>
                    <th>Nombre de voix</th>
                    <th></th>
                  </tr>
                  {infos?.candidates?.map((c) => (
                    <tr>
                      <td>
                        {c.liste}
                      </td>
                      <td>{c.nuance}</td>
                      <td>{c.nbVoix}</td>
                      <td>
                        {Math.round((c.nbVoix / infos?.bv?.exprimes) * 1000) / 10} %
                      </td>
                    </tr>
                  ))}
                </table>
            </div>
          :
            <div>Informations non disponibles</div>
        }
      </div>
    );
  } 
}
