#!/bin/bash
# Seed option groups and options for combo products
# Requires Supabase credentials through environment variables.

set -euo pipefail

if [[ -z "${SUPABASE_URL:-}" || -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  echo "Error: definí SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY antes de ejecutar este seed." >&2
  exit 1
fi

API="${SUPABASE_URL%/}/rest/v1"
KEY="$SUPABASE_SERVICE_ROLE_KEY"

# Product UUIDs
P1="e64505b9-0a89-4c04-9529-1f17d93aef95"  # 1/4 de Pollo a la Brasa
P2="c40a8b2c-7215-4839-9314-e7d3d91cd121"  # 1 Pollo a la Brasa
P3="96b2bb80-5c40-4496-a817-be2db106d49a"  # Parrilla a Compartir
P4="062fcfc3-7119-477d-8fab-b6db32c8cc71"  # Mix Personal

# ---------- Helper functions ----------
post() {
  curl -fsS "$API/$1" \
    -H "apikey: $KEY" \
    -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "$2"
}

# ---------- Insert groups ----------
echo "=== Insertando option groups ==="

# 1/4 Pollo a la Brasa
post "product_option_groups" "[
  {\"product_id\":\"$P1\",\"name\":\"Elige tu Complemento\",\"selection_type\":\"single\",\"min_select\":1,\"max_select\":1,\"is_required\":true,\"sort_order\":1},
  {\"product_id\":\"$P1\",\"name\":\"Elige tu Bebida\",\"selection_type\":\"single\",\"min_select\":1,\"max_select\":1,\"is_required\":true,\"sort_order\":2},
  {\"product_id\":\"$P1\",\"name\":\"Agrega un Extra\",\"selection_type\":\"quantity\",\"min_select\":0,\"max_select\":5,\"is_required\":false,\"sort_order\":3}
]" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f'  Group: {g[\"name\"]} [{g[\"id\"]}]') for g in d]"

# 1 Pollo a la Brasa (same structure)
post "product_option_groups" "[
  {\"product_id\":\"$P2\",\"name\":\"Elige tu Complemento\",\"selection_type\":\"single\",\"min_select\":1,\"max_select\":1,\"is_required\":true,\"sort_order\":1},
  {\"product_id\":\"$P2\",\"name\":\"Elige tu Bebida\",\"selection_type\":\"single\",\"min_select\":1,\"max_select\":1,\"is_required\":true,\"sort_order\":2},
  {\"product_id\":\"$P2\",\"name\":\"Agrega un Extra\",\"selection_type\":\"quantity\",\"min_select\":0,\"max_select\":5,\"is_required\":false,\"sort_order\":3}
]" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f'  Group: {g[\"name\"]} [{g[\"id\"]}]') for g in d]"

# Parrilla a Compartir (more options)
post "product_option_groups" "[
  {\"product_id\":\"$P3\",\"name\":\"Elige tu Complemento\",\"selection_type\":\"single\",\"min_select\":1,\"max_select\":1,\"is_required\":true,\"sort_order\":1},
  {\"product_id\":\"$P3\",\"name\":\"Elige tu Bebida\",\"selection_type\":\"single\",\"min_select\":1,\"max_select\":1,\"is_required\":true,\"sort_order\":2},
  {\"product_id\":\"$P3\",\"name\":\"Agrega un Extra\",\"selection_type\":\"quantity\",\"min_select\":0,\"max_select\":5,\"is_required\":false,\"sort_order\":3}
]" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f'  Group: {g[\"name\"]} [{g[\"id\"]}]') for g in d]"

# Mix Personal
post "product_option_groups" "[
  {\"product_id\":\"$P4\",\"name\":\"Elige tu Complemento\",\"selection_type\":\"single\",\"min_select\":1,\"max_select\":1,\"is_required\":true,\"sort_order\":1},
  {\"product_id\":\"$P4\",\"name\":\"Elige tu Bebida\",\"selection_type\":\"single\",\"min_select\":1,\"max_select\":1,\"is_required\":true,\"sort_order\":2},
  {\"product_id\":\"$P4\",\"name\":\"Agrega un Extra\",\"selection_type\":\"quantity\",\"min_select\":0,\"max_select\":5,\"is_required\":false,\"sort_order\":3}
]" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f'  Group: {g[\"name\"]} [{g[\"id\"]}]') for g in d]"

# ---------- Get all inserted groups to get IDs ----------
echo ""
echo "=== Agregando options a los groups ==="

ALL_GROUPS=$(curl -s "$API/product_option_groups?select=id,name,product_id&order=sort_order" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $KEY")

# Insert options for each "Complemento" group
for GID in $(echo "$ALL_GROUPS" | python3 -c "
import sys,json
data=json.load(sys.stdin)
for g in data:
  if g['name']=='Elige tu Complemento':
    print(g['id'])
"); do
  post "product_options" "[
    {\"group_id\":\"$GID\",\"name\":\"Papas Fritas\",\"price_delta\":0,\"sort_order\":1},
    {\"group_id\":\"$GID\",\"name\":\"Ensalada Fresca\",\"price_delta\":0,\"sort_order\":2},
    {\"group_id\":\"$GID\",\"name\":\"Puré de Papas\",\"price_delta\":0,\"sort_order\":3}
  ]" > /dev/null
  echo "  Options added to Complemento [$GID]"
done

# Insert options for each "Bebida" group
for GID in $(echo "$ALL_GROUPS" | python3 -c "
import sys,json
data=json.load(sys.stdin)
for g in data:
  if g['name']=='Elige tu Bebida':
    print(g['id'])
"); do
  post "product_options" "[
    {\"group_id\":\"$GID\",\"name\":\"Chicha Morada\",\"price_delta\":0,\"sort_order\":1},
    {\"group_id\":\"$GID\",\"name\":\"Gaseosa\",\"price_delta\":0,\"sort_order\":2},
    {\"group_id\":\"$GID\",\"name\":\"Agua\",\"price_delta\":0,\"sort_order\":3}
  ]" > /dev/null
  echo "  Options added to Bebida [$GID]"
done

# Insert options for each "Extra" group
for GID in $(echo "$ALL_GROUPS" | python3 -c "
import sys,json
data=json.load(sys.stdin)
for g in data:
  if g['name']=='Agrega un Extra':
    print(g['id'])
"); do
  post "product_options" "[
    {\"group_id\":\"$GID\",\"name\":\"Extra Pollo\",\"price_delta\":6.00,\"sort_order\":1},
    {\"group_id\":\"$GID\",\"name\":\"Extra Salchicha\",\"price_delta\":3.00,\"sort_order\":2},
    {\"group_id\":\"$GID\",\"name\":\"Extra Queso\",\"price_delta\":2.00,\"sort_order\":3},
    {\"group_id\":\"$GID\",\"name\":\"Guacamole\",\"price_delta\":4.00,\"sort_order\":4},
    {\"group_id\":\"$GID\",\"name\":\"Salsa Adicional\",\"price_delta\":1.00,\"sort_order\":5}
  ]" > /dev/null
  echo "  Options added to Extra [$GID]"
done

echo ""
echo "=== Seed completo! ==="
echo "Productos con option groups: 1/4 Pollo, 1 Pollo, Parrilla a Compartir, Mix Personal"
