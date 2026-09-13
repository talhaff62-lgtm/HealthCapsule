#!/bin/bash
set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
ADMIN_EMAIL="${ADMIN_EMAIL:-${1}}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-${2}}"

if [ -z "$ADMIN_EMAIL" ] || [ -z "$ADMIN_PASSWORD" ]; then
  echo "Usage: $0 <admin_email> <admin_password>"
  echo "Or set BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD env vars"
  exit 1
fi

PASS_COUNT=0
FAIL_COUNT=0

pass() {
  echo "✓ PASS: $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  echo "✗ FAIL: $1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

echo "=== HealthCapsule API Smoke Test (v2) ==="
echo "BASE_URL: $BASE_URL"
echo

# 1. Admin login
echo "[1] Admin login..."
ADMIN_LOGIN_RESP=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.token||'');")

if [ -n "$ADMIN_TOKEN" ]; then
  pass "Admin login successful"
else
  fail "Admin login failed: $ADMIN_LOGIN_RESP"
  echo "SMOKE TEST FAILED"
  exit 1
fi

# 2. GET /auth/me with bearer token
echo "[2] GET /auth/me with bearer token..."
ME_RESP=$(curl -s -X GET "$BASE_URL/api/v1/auth/me" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
ME_ROLE=$(echo "$ME_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.role||'');")
ADMIN_ID=$(echo "$ME_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.id||'');")

if [ "$ME_ROLE" = "ADMIN" ] && [ -n "$ADMIN_ID" ]; then
  pass "GET /auth/me returns role ADMIN"
else
  fail "GET /auth/me failed: $ME_RESP"
fi

# 3. GET /auth/me without token (expect 401)
echo "[3] GET /auth/me without token..."
NO_AUTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/auth/me")
if [ "$NO_AUTH_CODE" = "401" ]; then
  pass "GET /auth/me without token returns 401"
else
  fail "Expected 401, got $NO_AUTH_CODE"
fi

# 4. Admin POST /users create staff
echo "[4] Admin POST /users (create staff)..."
STAFF_EMAIL="staff_test@test.local"
STAFF_CREATE_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Staff\",\"email\":\"$STAFF_EMAIL\",\"password\":\"password123\",\"role\":\"STAFF\"}")
CREATE_CODE=$(echo "$STAFF_CREATE_RESP" | tail -n1)
CREATE_BODY=$(echo "$STAFF_CREATE_RESP" | sed '$d')

if [ "$CREATE_CODE" = "201" ] || [ "$CREATE_CODE" = "409" ]; then
  pass "Staff account created or exists (code $CREATE_CODE)"
else
  fail "Staff user creation failed (code $CREATE_CODE): $CREATE_BODY"
fi

# 5. Staff login
echo "[5] Staff login..."
STAFF_LOGIN_RESP=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$STAFF_EMAIL\",\"password\":\"password123\"}")
STAFF_TOKEN=$(echo "$STAFF_LOGIN_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.token||'');")
STAFF_ID=$(echo "$STAFF_LOGIN_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.user?.id||'');")

if [ -n "$STAFF_TOKEN" ] && [ -n "$STAFF_ID" ]; then
  pass "Staff login successful, got token and staff id"
else
  fail "Staff login failed: $STAFF_LOGIN_RESP"
  echo "SMOKE TEST FAILED"
  exit 1
fi

# 6. Reference APIs (amenities, areas, specialties)
echo "[6] GET /amenities, /areas, /specialties..."
AMENITIES_RESP=$(curl -s -X GET "$BASE_URL/api/v1/amenities" -H "Authorization: Bearer $STAFF_TOKEN")
AMENITY_COUNT=$(echo "$AMENITIES_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(Array.isArray(d) ? d.length : 0);")
AMENITY_IDS=$(echo "$AMENITIES_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.slice(0,2).map(a=>a.id).join(','));")

AREAS_RESP=$(curl -s -X GET "$BASE_URL/api/v1/areas" -H "Authorization: Bearer $STAFF_TOKEN")
AREA_COUNT=$(echo "$AREAS_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(Array.isArray(d) ? d.length : 0);")
AREA_ID=$(echo "$AREAS_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d[0]?.id||'');")

SPECIALTIES_RESP=$(curl -s -X GET "$BASE_URL/api/v1/specialties" -H "Authorization: Bearer $STAFF_TOKEN")
SPECIALTY_COUNT=$(echo "$SPECIALTIES_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(Array.isArray(d) ? d.length : 0);")

if [ "$AMENITY_COUNT" -ge 8 ] && [ "$AREA_COUNT" -ge 1 ] && [ "$SPECIALTY_COUNT" -ge 0 ]; then
  pass "Reference endpoints returned valid data (Amenities: $AMENITY_COUNT, Areas: $AREA_COUNT, Specialties: $SPECIALTY_COUNT)"
else
  fail "Reference endpoints failed: amenities=$AMENITY_COUNT, areas=$AREA_COUNT, specialties=$SPECIALTY_COUNT"
fi

# 7. Staff POST /facilities
echo "[7] Staff POST /facilities..."
AMENITY_1=$(echo "$AMENITY_IDS" | cut -d',' -f1)
AMENITY_2=$(echo "$AMENITY_IDS" | cut -d',' -f2)

FACILITY_RESP=$(curl -s -X POST "$BASE_URL/api/v1/facilities" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Hospital\",\"address\":\"Test Address\",\"type\":\"HOSPITAL\",\"areaId\":\"$AREA_ID\",\"amenityIds\":[\"$AMENITY_1\",\"$AMENITY_2\"],\"discountInfo\":\"10%\"}")

FACILITY_ID=$(echo "$FACILITY_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.id||'');")
FACILITY_STATUS=$(echo "$FACILITY_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.verificationStatus||'');")
FACILITY_COLLECTOR=$(echo "$FACILITY_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.collectedById||'');")
FACILITY_SLUG=$(echo "$FACILITY_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.slug||'');")
FACILITY_AMENITIES_COUNT=$(echo "$FACILITY_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(Array.isArray(d.amenities) ? d.amenities.length : 0);")

if [ "$FACILITY_STATUS" = "PENDING" ] && [ "$FACILITY_COLLECTOR" = "$STAFF_ID" ] && [ -n "$FACILITY_SLUG" ] && [ "$FACILITY_AMENITIES_COUNT" -eq 2 ]; then
  pass "Facility created: status=PENDING, collectedById=staff id, slug present, amenities=2"
else
  fail "Facility creation unexpected response: $FACILITY_RESP"
fi

# 8. Staff POST /doctors
echo "[8] Staff POST /doctors..."
DOCTOR_RESP=$(curl -s -X POST "$BASE_URL/api/v1/doctors" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Doctor\",\"specialization\":\"Cardiology\",\"degrees\":\"MBBS, FCPS\",\"currentPosition\":\"Consultant\",\"achievements\":\"None\",\"facilityId\":\"$FACILITY_ID\"}")

DOCTOR_ID=$(echo "$DOCTOR_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.id||'');")
DOCTOR_CHAMBER_FACILITY=$(echo "$DOCTOR_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.chambers?.[0]?.facility?.name||'');")
DOCTOR_SPECIALTY_NAME=$(echo "$DOCTOR_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.specialties?.[0]?.specialty?.name||'');")

if [ -n "$DOCTOR_ID" ] && [ "$DOCTOR_CHAMBER_FACILITY" = "Test Hospital" ] && [ "$DOCTOR_SPECIALTY_NAME" = "Cardiology" ]; then
  pass "Doctor created: chamber facility matches, specialty is Cardiology"
else
  fail "Doctor creation issue: $DOCTOR_RESP"
fi

# 9. Staff GET /facilities/mine and /doctors/mine
echo "[9] Staff GET /facilities/mine and /doctors/mine..."
MINE_FACILITIES=$(curl -s -X GET "$BASE_URL/api/v1/facilities/mine" -H "Authorization: Bearer $STAFF_TOKEN")
MINE_DOCTORS=$(curl -s -X GET "$BASE_URL/api/v1/doctors/mine" -H "Authorization: Bearer $STAFF_TOKEN")

HAS_FACILITY=$(echo "$MINE_FACILITIES" | grep -q "$FACILITY_ID" && echo "yes" || echo "no")
HAS_DOCTOR=$(echo "$MINE_DOCTORS" | grep -q "$DOCTOR_ID" && echo "yes" || echo "no")

if [ "$HAS_FACILITY" = "yes" ] && [ "$HAS_DOCTOR" = "yes" ]; then
  pass "Staff mine routes return created facility and doctor"
else
  fail "Mine routes missing entries: facility=$HAS_FACILITY, doctor=$HAS_DOCTOR"
fi

# 10. Staff GET /facilities (admin list, expect 403)
echo "[10] Staff GET /facilities (expect 403)..."
STAFF_LIST_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/facilities" -H "Authorization: Bearer $STAFF_TOKEN")
if [ "$STAFF_LIST_CODE" = "403" ]; then
  pass "Staff GET /facilities returns 403"
else
  fail "Expected 403, got $STAFF_LIST_CODE"
fi

# 11. Admin GET /facilities?verificationStatus=PENDING and /doctors?verificationStatus=PENDING
echo "[11] Admin GET /facilities?verificationStatus=PENDING & /doctors?verificationStatus=PENDING..."
ADMIN_FACILITIES=$(curl -s -X GET "$BASE_URL/api/v1/facilities?verificationStatus=PENDING" -H "Authorization: Bearer $ADMIN_TOKEN")
ADMIN_DOCTORS=$(curl -s -X GET "$BASE_URL/api/v1/doctors?verificationStatus=PENDING" -H "Authorization: Bearer $ADMIN_TOKEN")

ADMIN_HAS_FACILITY=$(echo "$ADMIN_FACILITIES" | grep -q "$FACILITY_ID" && echo "yes" || echo "no")
ADMIN_HAS_DOCTOR=$(echo "$ADMIN_DOCTORS" | grep -q "$DOCTOR_ID" && echo "yes" || echo "no")

if [ "$ADMIN_HAS_FACILITY" = "yes" ] && [ "$ADMIN_HAS_DOCTOR" = "yes" ]; then
  pass "Admin PENDING lists contain facility and doctor"
else
  fail "Admin lists missing entries: facility=$ADMIN_HAS_FACILITY, doctor=$ADMIN_HAS_DOCTOR"
fi

# 12. Admin PATCH /facilities/:id/approve
echo "[12] Admin PATCH /facilities/$FACILITY_ID/approve..."
APPROVE_RESP=$(curl -s -X PATCH "$BASE_URL/api/v1/facilities/$FACILITY_ID/approve" -H "Authorization: Bearer $ADMIN_TOKEN")
APPROVED_STATUS=$(echo "$APPROVE_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.verificationStatus||'');")
APPROVED_REVIEWER=$(echo "$APPROVE_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.reviewedById||'');")

if [ "$APPROVED_STATUS" = "VERIFIED" ] && [ "$APPROVED_REVIEWER" = "$ADMIN_ID" ]; then
  pass "Facility approved: verificationStatus=VERIFIED, reviewedById=admin id"
else
  fail "Facility approve issue: $APPROVE_RESP"
fi

# 13. Admin PATCH /doctors/:id/reject
echo "[13] Admin PATCH /doctors/$DOCTOR_ID/reject..."
REJECT_RESP=$(curl -s -X PATCH "$BASE_URL/api/v1/doctors/$DOCTOR_ID/reject" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"rejectReason\":\"Incomplete info\"}")
REJECTED_STATUS=$(echo "$REJECT_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.verificationStatus||'');")

if [ "$REJECTED_STATUS" = "REJECTED" ]; then
  pass "Doctor rejected: verificationStatus=REJECTED"
else
  fail "Doctor reject issue: $REJECT_RESP"
fi

# 14. Staff GET /facilities/mine and /doctors/mine check status
echo "[14] Staff GET mine status check..."
MINE_FAC_2=$(curl -s -X GET "$BASE_URL/api/v1/facilities/mine" -H "Authorization: Bearer $STAFF_TOKEN")
MINE_DOC_2=$(curl -s -X GET "$BASE_URL/api/v1/doctors/mine" -H "Authorization: Bearer $STAFF_TOKEN")

FAC_STATUS_VERIFIED=$(echo "$MINE_FAC_2" | grep -q "VERIFIED" && echo "yes" || echo "no")
DOC_STATUS_REJECTED=$(echo "$MINE_DOC_2" | grep -q "REJECTED" && echo "yes" || echo "no")

if [ "$FAC_STATUS_VERIFIED" = "yes" ] && [ "$DOC_STATUS_REJECTED" = "yes" ]; then
  pass "Staff mine lists show VERIFIED for facility and REJECTED for doctor"
else
  fail "Status update verification failed: facility=$FAC_STATUS_VERIFIED, doctor=$DOC_STATUS_REJECTED"
fi

# 15. Injection test
echo "[15] Staff POST /facilities injection attempt..."
INJECT_RESP=$(curl -s -X POST "$BASE_URL/api/v1/facilities" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Inject Test\",\"address\":\"Address\",\"areaId\":\"$AREA_ID\",\"verificationStatus\":\"VERIFIED\",\"collectedById\":\"hax\",\"reviewedById\":\"hax\"}")

INJECT_STATUS=$(echo "$INJECT_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.verificationStatus||'');")
INJECT_COLLECTOR=$(echo "$INJECT_RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.collectedById||'');")

if [ "$INJECT_STATUS" = "PENDING" ] && [ "$INJECT_COLLECTOR" = "$STAFF_ID" ]; then
  pass "Injection test: verificationStatus=PENDING, collectedById=staff id (injection stripped)"
else
  fail "Injection test failed: status=$INJECT_STATUS, collector=$INJECT_COLLECTOR"
fi

# 16. Duplicate user creation (expect 409)
echo "[16] Admin POST /users with same email (expect 409)..."
DUP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Staff\",\"email\":\"$STAFF_EMAIL\",\"password\":\"password123\",\"role\":\"STAFF\"}")

if [ "$DUP_CODE" = "409" ]; then
  pass "Duplicate user creation returned 409"
else
  fail "Expected 409 for duplicate user, got $DUP_CODE"
fi

echo
echo "=== RESULTS ==="
echo "Passed: $PASS_COUNT"
echo "Failed: $FAIL_COUNT"
echo

if [ $FAIL_COUNT -eq 0 ]; then
  echo "SMOKE TEST PASSED"
  exit 0
else
  echo "SMOKE TEST FAILED"
  exit 1
fi
