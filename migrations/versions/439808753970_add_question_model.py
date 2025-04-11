"""Add question model

Revision ID: 439808753970
Revises: 
Create Date: 2025-04-10 20:03:53.083154

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '439808753970'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('quizzes',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=100), nullable=False),
    sa.Column('description', sa.String(length=255), nullable=True),
    sa.Column('grade_level', sa.String(length=20), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('questions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('question_text', sa.String(length=255), nullable=False),
    sa.Column('options', sa.PickleType(), nullable=False),
    sa.Column('answer', sa.String(length=100), nullable=False),
    sa.Column('quiz_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['quiz_id'], ['quizzes.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('questions')
    op.drop_table('quizzes')
    # ### end Alembic commands ###
