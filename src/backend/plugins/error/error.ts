import { FastifyInstance, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { HTTPError } from "../../utils/HTTPError";

export default fp(async (fastify: FastifyInstance) => {
  function sendError(this: FastifyReply, payload: any, code: number = 400) {
    this.code(code).send({ error: payload })  
  }
  fastify.decorateReply("error", sendError as any)
  
  // It is fast reply error 
  fastify.setErrorHandler((error, _request, reply) => {
    if (error.code === "P2002") {
      reply.error("Already exists", 409)
      return
    }
    if (error instanceof HTTPError) {
      reply.code(error.statusCode).send({ error: error.body })
      return
    }

    if (error.validation) {
      const _error: Record<string, { code?: string, message?: string }> = {}
      let counter = 0
      for (let field of error.validation) {
        if (typeof field.params.missingProperty === "string") {
          _error[field.params.missingProperty] = { code: "required", message: `Field "${field.params.missingProperty}" is required` }
          counter++
        }
      }
      if (counter === 0) {
        console.error(error)
        _error[error.validation[0].instancePath?.slice(1) ?? "unknown"] = { message: error.validation[0].message ?? "Validation error", code: "validationError" }
      }
      reply.code(400).send({ error: _error })
      return
    }

    console.error(error)
    reply.code(500).send({ error: "Server error" })
	})
}, { name: 'error' })

