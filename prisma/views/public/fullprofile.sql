SELECT
  perfil.user_id,
  perfil.nickname,
  perfil.biografia,
  jsonb_array_length((perfil.seguidores -> 'seguidores' :: text)) AS seguidores,
  jsonb_array_length((perfil.seguindo -> 'seguindo' :: text)) AS seguindo,
  curso.nm_curso,
  (
    (
      SELECT
        count(*) AS count
      FROM
        pensamentos p
      WHERE
        (p.user_id = perfil.user_id)
    )
  ) :: integer AS pensamentos
FROM
  (
    (
      perfil
      JOIN conta ON ((perfil.user_id = conta.user_id))
    )
    JOIN curso ON ((conta.curso_id = curso.curso_id))
  );