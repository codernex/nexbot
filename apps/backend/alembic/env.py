import asyncio

from alembic import context
from database import BaseModel  # adjust import
from database.models import *
from pgvector.sqlalchemy import Vector
from sqlalchemy.ext.asyncio import async_engine_from_config

config = context.config

# Overwrite database URL with the DATABASE_URL environment variable if set

config.set_main_option(
    "sqlalchemy.url", "postgresql+asyncpg://admin:123456@127.0.0.1:5432/chatbot"
)

target_metadata = BaseModel.metadata


def render_item(type_, obj, autogen_context):
    if type_ == "type" and isinstance(obj, Vector):
        autogen_context.imports.add("import pgvector.sqlalchemy")
        return f"pgvector.sqlalchemy.Vector({obj.dim})"
    return False


def run_migrations_sync(connection):
    context.configure(
        connection=connection, target_metadata=target_metadata, render_item=render_item
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online():
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        pool_pre_ping=True,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(run_migrations_sync)

    await connectable.dispose()


if context.is_offline_mode():
    pass
else:
    asyncio.run(run_migrations_online())
