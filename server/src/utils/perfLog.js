/** Log JSON một dòng — dễ đọc trên Vercel → Functions → Logs */
export function createRequestLogger(reqId) {
  const start = Date.now();

  return {
    reqId,
    info(step, extra = {}) {
      console.log(
        JSON.stringify({
          level: 'info',
          reqId,
          step,
          ms: Date.now() - start,
          ...extra,
        })
      );
    },
    error(step, err, extra = {}) {
      console.error(
        JSON.stringify({
          level: 'error',
          reqId,
          step,
          ms: Date.now() - start,
          message: err?.message || String(err),
          stack: err?.stack?.split('\n').slice(0, 5),
          ...extra,
        })
      );
    },
    elapsed() {
      return Date.now() - start;
    },
  };
}

export function newReqId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
