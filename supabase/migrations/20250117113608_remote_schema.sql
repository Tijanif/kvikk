drop policy "Allow public insert" on "public"."users";

alter table "public"."users" drop constraint "users_dateOfBirth_key";

drop index if exists "public"."users_dateOfBirth_key";

alter table "public"."users" drop column "dateOfBirth";

alter table "public"."users" drop column "name";

alter table "public"."users" drop column "phoneNumber";

alter table "public"."users" add column "address" text;

alter table "public"."users" add column "full_name" text;

alter table "public"."users" add column "phone_number" text;

alter table "public"."users" add column "updated_at" timestamp with time zone not null default timezone('utc'::text, now());

alter table "public"."users" add column "vipps_sub" text;

alter table "public"."users" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."users" alter column "email" drop not null;

alter table "public"."users" alter column "id" drop default;

CREATE UNIQUE INDEX users_vipps_sub_key ON public.users USING btree (vipps_sub);

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

alter table "public"."users" add constraint "users_vipps_sub_key" UNIQUE using index "users_vipps_sub_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

create policy "Users can update own profile"
on "public"."users"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can view own profile"
on "public"."users"
as permissive
for select
to public
using ((auth.uid() = id));


CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


