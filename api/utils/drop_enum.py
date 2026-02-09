import asyncio
from sqlalchemy import text
from core.database import engine


async def drop_enums():
    """Drop all existing ENUM types"""
    async with engine.begin() as conn:
        # Drop existing ENUMs
        await conn.execute(text("DROP TYPE IF EXISTS category CASCADE"))
        await conn.execute(text("DROP TYPE IF EXISTS urgency CASCADE"))
        await conn.execute(text("DROP TYPE IF EXISTS ticketstatus CASCADE"))
        
        print('✅ Dropped all ENUM types')
    
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(drop_enums())