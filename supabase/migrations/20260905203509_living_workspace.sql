alter table akilii.workspace_settings add column avatar text not null default '' check(length(avatar)<=40000);
