/*
# Remove WhatsApp Integration Tables

## Purpose
Removes the wa_conversations and wa_messages tables that were created exclusively
for the OpenWA integration. These tables are empty (0 rows) and have no dependencies
from other parts of the system.

## Tables Removed
- wa_messages — was only used by whatsapp-api edge function (now deleted)
- wa_conversations — was only used by whatsapp-api edge function (now deleted)

## Safety
- Both tables confirmed empty (0 rows each)
- No other edge functions or code reference these tables
- No foreign keys from other tables reference these tables
- CRM customers, leads, orders tables are NOT affected
*/

DROP TABLE IF EXISTS wa_messages CASCADE;
DROP TABLE IF EXISTS wa_conversations CASCADE;
