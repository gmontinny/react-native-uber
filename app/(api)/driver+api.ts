import { getDatabase } from "@/lib/database";

export async function GET(request: Request) {
  try {
    const sql = getDatabase();
    const response = await sql`SELECT * FROM drivers`;

    return Response.json({ data: response });
  } catch (error) {
    console.error("Erro ao buscar motoristas:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
