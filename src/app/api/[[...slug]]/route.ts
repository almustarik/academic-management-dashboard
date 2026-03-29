import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const getDb = () => {
    const dbPath = path.join(process.cwd(), 'db.json');
    if (!fs.existsSync(dbPath)) return {};
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
};

const saveDb = (db: any) => {
    // Note: This will work locally but not persist in Vercel production
    const dbPath = path.join(process.cwd(), 'db.json');
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug?: string[] }> }
) {
    const { slug } = await params;
    const db = getDb();

    if (!slug || slug.length === 0) {
        return NextResponse.json(db);
    }

    const [resource, id] = slug;
    const data = db[resource];

    if (!data) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (id) {
        const item = data.find((i: any) => i.id === id);
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(item);
    }

    return NextResponse.json(data);
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug?: string[] }> }
) {
    const { slug } = await params;
    if (!slug || slug.length === 0) {
        return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
    }

    const [resource] = slug;
    const db = getDb();
    
    if (!db[resource]) {
        db[resource] = [];
    }

    const body = await request.json();
    const newItem = { ...body, id: body.id || Math.random().toString(36).substr(2, 9) };
    
    db[resource].push(newItem);
    saveDb(db);

    return NextResponse.json(newItem, { status: 201 });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ slug?: string[] }> }
) {
    const { slug } = await params;
    if (!slug || slug.length < 2) {
        return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
    }

    const [resource, id] = slug;
    const db = getDb();
    const data = db[resource];

    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const index = data.findIndex((i: any) => i.id === id);
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await request.json();
    db[resource][index] = { ...db[resource][index], ...body };
    saveDb(db);

    return NextResponse.json(db[resource][index]);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug?: string[] }> }
) {
    const { slug } = await params;
    if (!slug || slug.length < 2) {
        return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
    }

    const [resource, id] = slug;
    const db = getDb();
    const data = db[resource];

    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    db[resource] = data.filter((i: any) => i.id !== id);
    saveDb(db);

    return new NextResponse(null, { status: 204 });
}
