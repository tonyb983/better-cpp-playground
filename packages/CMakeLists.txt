add_subdirectory(libs)
add_subdirectory(apps)

set(PG_ALL_DOCUMENTED_SOURCES "${PG_ALL_DOCUMENTED_SOURCES}" PARENT_SCOPE)
# file(REAL_PATH <path> <out-var> [BASE_DIRECTORY <dir>] [EXPAND_TILDE])