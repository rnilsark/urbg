import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/urbg',
});

// Log database connection status
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Get top scores
export async function GET(request) {
  try {
    console.log('Attempting to fetch scores from database...');
    const result = await pool.query(
      'SELECT player_name, score FROM score_board ORDER BY score DESC LIMIT 10'
    );
    
    console.log(`Successfully retrieved ${result.rows.length} scores`);
    return NextResponse.json({ scores: result.rows });
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch scores',
      message: error.message,
      detail: error.detail || 'No additional details'
    }, { status: 500 });
  }
}

// Submit a new score
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, score } = body;
    
    if (!name || !score) {
      return NextResponse.json({ error: 'Name and score are required' }, { status: 400 });
    }
    
    // Sanitize the name input to prevent SQL injection (even though parameterized queries are used)
    const sanitizedName = name.slice(0, 20).trim();
    
    console.log(`Attempting to insert score: ${sanitizedName} - ${score}`);
    const result = await pool.query(
      'INSERT INTO score_board (player_name, score) VALUES ($1, $2) RETURNING id',
      [sanitizedName, score]
    );
    
    console.log(`Score saved with ID: ${result.rows[0].id}`);
    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json({ 
      error: 'Failed to save score',
      message: error.message,
      detail: error.detail || 'No additional details'
    }, { status: 500 });
  }
} 