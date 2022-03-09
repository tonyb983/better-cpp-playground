
find_package(Doxygen)

if (Doxygen_FOUND)
    message(STATUS "Doxygen Found")
    # Set input and output files for Doxyfile
    set(DOXYFILE_IN "${CMAKE_CURRENT_SOURCE_DIR}/doxygen/Doxyfile.in")
    set(DOXYFILE_OUT "${CMAKE_CURRENT_BINARY_DIR}/Doxyfile.out")

    # Configure Doxyfile
    configure_file("${DOXYFILE_IN}" "${DOXYFILE_OUT}" @ONLY)

    # Custom target to create docs
    add_custom_target(docs
            COMMAND ${DOXYGEN_EXECUTABLE} "${DOXYFILE_OUT}"
            WORKING_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}
            COMMENT "Generating API Documentation with Doxygen"
            VERBATIM)
else (Doxygen_FOUND)
    message("Doxygen is not installed or could not be located through find_package")
endif ()