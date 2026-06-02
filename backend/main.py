import ast
import operator
import os
from enum import Enum
from pathlib import Path
from typing import Any
from uuid import UUID

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import Client, create_client

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError(
        "SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY .env dosyasında tanımlı olmalıdır."
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Frontend'in adresi
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_EXPRESSION_RESULT = 99

_ALLOWED_BINOPS: dict[type, Any] = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
}

_ALLOWED_UNARYOPS: dict[type, Any] = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}


class SessionStatus(str, Enum):
    completed = "completed"
    failed = "failed"
    abandoned = "abandoned"


class MatchRequest(BaseModel):
    expression_a: str = Field(..., min_length=1, examples=["12+4"])
    expression_b: str = Field(..., min_length=1, examples=["16"])


class SessionEndRequest(BaseModel):
    user_id: UUID
    level_id: int = Field(..., ge=1, le=3)
    status: SessionStatus
    duration: int = Field(..., ge=0, description="Oturum süresi (saniye)")
    errors: int = Field(..., ge=0, description="Yapılan hata sayısı")


class LayoutTile(BaseModel):
    id: str
    grid_col: int
    grid_row: int
    layer: int


class LevelResponse(BaseModel):
    level_id: int
    name: str
    difficulty_multiplier: float
    layout: list[LayoutTile]


LEVELS: dict[int, LevelResponse] = {
    1: LevelResponse(
        level_id=1,
        name="Kolay",
        difficulty_multiplier=1.0,
        layout=[
            LayoutTile(id="t1", grid_col=4, grid_row=1, layer=0),
            LayoutTile(id="t2", grid_col=5, grid_row=2, layer=0),
            LayoutTile(id="t3", grid_col=3, grid_row=2, layer=0),
            LayoutTile(id="t4", grid_col=2, grid_row=3, layer=0),
            LayoutTile(id="t5", grid_col=6, grid_row=3, layer=0),
            LayoutTile(id="t6", grid_col=4, grid_row=3, layer=1),
            LayoutTile(id="t7", grid_col=5, grid_row=3, layer=1),
            LayoutTile(id="t8", grid_col=1, grid_row=4, layer=0),
            LayoutTile(id="t9", grid_col=7, grid_row=4, layer=0),
            LayoutTile(id="t10", grid_col=3, grid_row=4, layer=0),
            LayoutTile(id="t11", grid_col=4, grid_row=4, layer=0),
            LayoutTile(id="t12", grid_col=6, grid_row=4, layer=0),
        ],
    ),
    2: LevelResponse(
        level_id=2,
        name="Orta",
        difficulty_multiplier=1.5,
        layout=[
            LayoutTile(id="t1", grid_col=3, grid_row=1, layer=0),
            LayoutTile(id="t2", grid_col=4, grid_row=1, layer=0),
            LayoutTile(id="t3", grid_col=5, grid_row=1, layer=0),
            LayoutTile(id="t4", grid_col=2, grid_row=2, layer=0),
            LayoutTile(id="t5", grid_col=6, grid_row=2, layer=0),
            LayoutTile(id="t6", grid_col=3, grid_row=2, layer=1),
            LayoutTile(id="t7", grid_col=5, grid_row=2, layer=1),
            LayoutTile(id="t8", grid_col=4, grid_row=2, layer=1),
            LayoutTile(id="t9", grid_col=1, grid_row=3, layer=0),
            LayoutTile(id="t10", grid_col=7, grid_row=3, layer=0),
            LayoutTile(id="t11", grid_col=3, grid_row=3, layer=0),
            LayoutTile(id="t12", grid_col=5, grid_row=3, layer=0),
            LayoutTile(id="t13", grid_col=4, grid_row=3, layer=1),
            LayoutTile(id="t14", grid_col=2, grid_row=4, layer=0),
            LayoutTile(id="t15", grid_col=6, grid_row=4, layer=0),
            LayoutTile(id="t16", grid_col=4, grid_row=4, layer=0),
            LayoutTile(id="t17", grid_col=3, grid_row=4, layer=1),
            LayoutTile(id="t18", grid_col=5, grid_row=4, layer=1),
        ],
    ),
    3: LevelResponse(
        level_id=3,
        name="Zor",
        difficulty_multiplier=2.0,
        layout=[
            LayoutTile(id="t1", grid_col=2, grid_row=1, layer=0),
            LayoutTile(id="t2", grid_col=3, grid_row=1, layer=0),
            LayoutTile(id="t3", grid_col=4, grid_row=1, layer=0),
            LayoutTile(id="t4", grid_col=5, grid_row=1, layer=0),
            LayoutTile(id="t5", grid_col=6, grid_row=1, layer=0),
            LayoutTile(id="t6", grid_col=1, grid_row=2, layer=0),
            LayoutTile(id="t7", grid_col=7, grid_row=2, layer=0),
            LayoutTile(id="t8", grid_col=3, grid_row=2, layer=1),
            LayoutTile(id="t9", grid_col=5, grid_row=2, layer=1),
            LayoutTile(id="t10", grid_col=4, grid_row=2, layer=1),
            LayoutTile(id="t11", grid_col=2, grid_row=3, layer=0),
            LayoutTile(id="t12", grid_col=6, grid_row=3, layer=0),
            LayoutTile(id="t13", grid_col=3, grid_row=3, layer=0),
            LayoutTile(id="t14", grid_col=5, grid_row=3, layer=0),
            LayoutTile(id="t15", grid_col=4, grid_row=3, layer=1),
            LayoutTile(id="t16", grid_col=3, grid_row=3, layer=2),
            LayoutTile(id="t17", grid_col=5, grid_row=3, layer=2),
            LayoutTile(id="t18", grid_col=1, grid_row=4, layer=0),
            LayoutTile(id="t19", grid_col=7, grid_row=4, layer=0),
            LayoutTile(id="t20", grid_col=2, grid_row=4, layer=0),
            LayoutTile(id="t21", grid_col=6, grid_row=4, layer=0),
            LayoutTile(id="t22", grid_col=4, grid_row=4, layer=0),
            LayoutTile(id="t23", grid_col=3, grid_row=4, layer=1),
            LayoutTile(id="t24", grid_col=5, grid_row=4, layer=1),
        ],
    ),
}


def _normalize_expression(expression: str) -> str:
    return expression.strip().replace(" ", "")


def _eval_ast_node(node: ast.AST) -> int:
    if isinstance(node, ast.Constant):
        if isinstance(node.value, bool) or not isinstance(node.value, int):
            raise ValueError("Yalnızca tam sayılar desteklenir.")
        return node.value

    if isinstance(node, ast.UnaryOp):
        op_func = _ALLOWED_UNARYOPS.get(type(node.op))
        if op_func is None:
            raise ValueError("Desteklenmeyen unary operatör.")
        return op_func(_eval_ast_node(node.operand))

    if isinstance(node, ast.BinOp):
        op_func = _ALLOWED_BINOPS.get(type(node.op))
        if op_func is None:
            raise ValueError("Desteklenmeyen operatör. MVP: +, -, *")
        left = _eval_ast_node(node.left)
        right = _eval_ast_node(node.right)
        return op_func(left, right)

    raise ValueError("Geçersiz ifade yapısı.")


def evaluate_expression(expression: str) -> int:
    normalized = _normalize_expression(expression)
    if not normalized:
        raise ValueError("İfade boş olamaz.")
    if not all(ch.isdigit() or ch in "+-*()" for ch in normalized):
        raise ValueError("İfade yalnızca rakam ve +, -, * operatörlerini içerebilir.")

    tree = ast.parse(normalized, mode="eval")
    result = _eval_ast_node(tree.body)

    if result < 0 or result > MAX_EXPRESSION_RESULT:
        raise ValueError(f"Sonuç 0 ile {MAX_EXPRESSION_RESULT} arasında olmalıdır.")

    return result


@app.get("/")
def read_root():
    try:
        result = supabase.table("users").select("*").limit(1).execute()
        return {
            "status": "Çalışıyor",
            "database_connected": True,
            "users": result.data,
        }
    except Exception as exc:
        return {
            "status": "Çalışıyor",
            "database_connected": False,
            "error": str(exc),
        }


@app.get("/api/level/{level_id}", response_model=LevelResponse)
def get_level(level_id: int):
    level = LEVELS.get(level_id)
    if level is None:
        raise HTTPException(
            status_code=404,
            detail="Geçersiz seviye. level_id 1 (Kolay), 2 (Orta) veya 3 (Zor) olmalıdır.",
        )
    return level


@app.post("/api/match")
def check_match(body: MatchRequest):
    try:
        value_a = evaluate_expression(body.expression_a)
        value_b = evaluate_expression(body.expression_b)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {"match": value_a == value_b}


@app.post("/api/session/end")
def end_session(body: SessionEndRequest):
    row = {
        "user_id": str(body.user_id),
        "level_id": body.level_id,
        "status": body.status.value,
        "duration_seconds": body.duration,
        "errors_made": body.errors,
    }

    try:
        result = supabase.table("game_sessions").insert(row).execute()
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Oturum kaydedilemedi: {exc}",
        ) from exc

    if not result.data:
        raise HTTPException(status_code=500, detail="Oturum kaydı oluşturulamadı.")

    return {"success": True, "session": result.data[0]}
