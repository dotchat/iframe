import { bus, IBusCall, IBusSubscriptionCallback, uuid } from "@dotchat/bus";

let iframeId = undefined;

bus.subscribe({
  once: true,
  subject: "#/dotchat/iframe/id",
  callback: {
    next: (sub) => {
      iframeId = sub.data;
    },
  },
});
``;

const validateReciveMessage = (data: any) =>
  data &&
  data.token != undefined &&
  data.token == "dotchat-iframe-message" &&
  data.message != undefined &&
  typeof data.message == "object" &&
  data.message.subject != undefined &&
  typeof data.message.subject == "string";

window.addEventListener("message", (event) => {
  let data = event.data;
  if (validateReciveMessage(data)) {
    const { subject, param } = data.message;
    bus.call({
      subject,
      param,
    });
  }
});

const send = (param: IBusCall) => {
  const id = uuid();
  param.id = id;

  window.postMessage(
    {
      id: iframeId,
      token: "dotchat-iframe-message",
      message: param,
    },
    "*"
  );

  return {
    id: id,
    // subscribe for back results
    subscribe: (callback: IBusSubscriptionCallback) => {
      return bus.subscribe({
        once: true,
        subject: `${param.subject}/back/${id}`,
        callback: callback,
      });
    },
  };
};

const dotchat = {
  bus: {
    subjects: bus.subjects,
    subscribe: bus.subscribe,
    call: bus.call,
  },
  send,
  subscribe: bus.subscribe,
};

if (window != undefined) (window as any).dotchat = dotchat;

export default dotchat;
