import asyncio
from sqlalchemy import text
from core.database import engine, Base
from models.ticket import Ticket


async def full_reset():
    """Complete database reset"""
    print("🗑️  Starting full reset...\n")
    
    async with engine.begin() as conn:
        # 1. Drop alembic_version
        print("1. Dropping alembic_version...")
        await conn.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE"))
        print("   ✅ Done\n")
        
        # 2. Drop all tables
        print("2. Dropping all tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("   ✅ Done\n")
        
        # 3. Drop all ENUM types
        print("3. Dropping ENUM types...")
        await conn.execute(text("DROP TYPE IF EXISTS category CASCADE"))
        await conn.execute(text("DROP TYPE IF EXISTS urgency CASCADE"))
        await conn.execute(text("DROP TYPE IF EXISTS ticketstatus CASCADE"))
        print("   ✅ Done\n")
    
    await engine.dispose()
    
    print("✅ Full reset complete!\n")
    print("📝 Next steps:")
    print("   1. alembic upgrade head")
    print("   or")
    print("   1. alembic revision --autogenerate -m 'initial'")
    print("   2. alembic upgrade head")


if __name__ == "__main__":
    asyncio.run(full_reset())