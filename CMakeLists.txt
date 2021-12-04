cmake_minimum_required(VERSION 3.6)
project(hyperion-webos VERSION 1.0 LANGUAGES C)

add_subdirectory(hyperion-webos/tv-native-apis)
add_subdirectory(hyperion-webos/flatccrt)

find_package(PkgConfig REQUIRED)

# ---
# find required packages
include(FindPkgConfig)

pkg_check_modules(GTHREAD2 REQUIRED gthread-2.0)
include_directories(${GTHREAD2_INCLUDE_DIRS})

pkg_check_modules(PBNJSON REQUIRED pbnjson_c)
include_directories(${PBNJSON_INCLUDE_DIRS})

# -- check for glib 2.0
pkg_check_modules(GLIB2 REQUIRED glib-2.0)
include_directories(${GLIB2_INCLUDE_DIRS})

pkg_check_modules(LS2 REQUIRED luna-service2)
include_directories(${LS2_INCLUDE_DIRS})

pkg_check_modules(PMLOG REQUIRED PmLogLib)
include_directories(${PMLOG_INCLUDE_DIRS})

pkg_check_modules(EGL egl REQUIRED)
pkg_check_modules(GLESv2 glesv2 REQUIRED)

add_executable(hyperion-webos
    hyperion-webos/src/main.c
    hyperion-webos/src/hyperion_client.c
 )
target_include_directories(hyperion-webos PRIVATE fbs)
target_link_libraries(hyperion-webos flatccrt pthread dl ${GTHREAD2_LDFLAGS} ${PBNJSON_LDFLAGS} ${LS2_LDFLAGS} ${GLIB2_LDFLAGS} ${PMLOG_LDFLAGS})

file(COPY ${CMAKE_SOURCE_DIR}/services.json DESTINATION "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}")

# Backends
add_library(vt_backend SHARED
    hyperion-webos/src/backends/libvt.c
)

target_compile_definitions(vt_backend PRIVATE CAPTURE_BACKEND)
target_include_directories(vt_backend PRIVATE src hyperion-webos/src/backends)
target_link_libraries(vt_backend vt ${GLESv2_LIBRARIES} ${EGL_LIBRARIES})

add_library(vtcapture_backend SHARED
    hyperion-webos/src/backends/libvtcapture.c
)

target_compile_definitions(vtcapture_backend PRIVATE CAPTURE_BACKEND)
target_include_directories(vtcapture_backend PRIVATE src hyperion-webos/src/backends)
target_link_libraries(vtcapture_backend vtcapture halgal)

add_library(dile_vt_backend SHARED
    hyperion-webos/src/backends/libdile_vt.c
)

target_compile_definitions(dile_vt_backend PRIVATE CAPTURE_BACKEND)
target_include_directories(dile_vt_backend PRIVATE src hyperion-webos/src/backends)
target_link_libraries(dile_vt_backend dile_vt)

# libdile_vt.so seems to be missing DT_NEEDED for libPmLogLib.so.3 - let's just
# add it over to our library. For some reason adding PmLogLib loaded via
# pkgconfig to target_link_libraries doesn't work...
set_target_properties(dile_vt_backend PROPERTIES LINK_FLAGS "-lPmLogLib")
