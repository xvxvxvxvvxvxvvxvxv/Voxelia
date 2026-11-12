// OpenGL: vitaGL sulla console, OpenGL 2.1 (Mesa) nella build di prova per PC
#ifndef GLINC_H
#define GLINC_H
#ifdef __vita__
#include <vitaGL.h>
#else
#define GL_GLEXT_PROTOTYPES
#include <GL/gl.h>
#include <GL/glext.h>
#endif
GLuint glProgram(const char *vs, const char *fs, const char **attrs, int nattr);
#endif
