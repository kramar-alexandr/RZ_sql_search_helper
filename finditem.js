import { db } from './db.js';

// Процедура-обработчик для POST /finditem
export async function findItemHandler(req, res) {
  const { names } = req.body;
  
  if (!Array.isArray(names) || names.length === 0) {
    return res.status(400).json({ error: 'names (array) field is required' });
  }
  try {
    // Для каждого названия ищем максимально подходящее совпадение по 3 полям с помощью FTS и pg_trgm
    const results = await Promise.all(
      names.map(async (name) => {
        console.log('Received name:', name);
        // Формируем FTS и similarity для всех трёх полей
        const searchQuery = `
          SELECT code,
                 GREATEST(
                   ts_rank(to_tsvector('simple', name), plainto_tsquery('simple', ?)),
                   ts_rank(to_tsvector('simple', addname), plainto_tsquery('simple', ?)),
                   ts_rank(to_tsvector('simple', alternativecode), plainto_tsquery('simple', ?))
                 ) AS rank,
                 GREATEST(
                   similarity(name, ?),
                   similarity(addname, ?),
                   similarity(alternativecode, ?)
                 ) AS sim
          FROM invc
          WHERE 
            to_tsvector('simple', name) @@ plainto_tsquery('simple', ?)
            OR to_tsvector('simple', addname) @@ plainto_tsquery('simple', ?)
            OR to_tsvector('simple', alternativecode) @@ plainto_tsquery('simple', ?)
            OR similarity(name, ?) > 0.3
            OR similarity(addname, ?) > 0.3
            OR similarity(alternativecode, ?) > 0.3
          ORDER BY rank DESC, sim DESC
          LIMIT 1;
        `;
        const bindings = [name, name, name, name, name, name, name, name, name, name, name, name];
        //console.log('SQL:', searchQuery, 'Bindings:', bindings);
        const { rows } = await db.raw(searchQuery, bindings);
        console.log('DB rows:', rows);
        return rows.length > 0 ? rows[0].code : null;
      })
    );
    res.json({ codes: results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
}
