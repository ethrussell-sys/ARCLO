alter table purchases alter column download_limit set default 1;
update purchases set download_limit = 1;
