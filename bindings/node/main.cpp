#include <cstdint>
#include <cstdio>
#include <cstring>
#include <nan.h>

#include "jurischain.h"

class Jurischain : public Nan::ObjectWrap {
public:
  static NAN_MODULE_INIT(Init) {
    v8::Local<v8::FunctionTemplate> ctor =
        Nan::New<v8::FunctionTemplate>(Jurischain::New);
    static Nan::Persistent<v8::Function> constructor;

    ctor->SetClassName(Nan::New("Jurischain").ToLocalChecked());
    ctor->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(ctor, "challengeResponse", Define);
    Nan::SetPrototypeMethod(ctor, "readChallenge", Retrieve);
    Nan::SetPrototypeMethod(ctor, "solveStep", Solve);
    Nan::SetPrototypeMethod(ctor, "verify", Verify);

    constructor.Reset(Nan::GetFunction(ctor).ToLocalChecked());
    Nan::Set(target, Nan::New("Jurischain").ToLocalChecked(),
             Nan::GetFunction(ctor).ToLocalChecked());
  }

private:
  jurischain_ctx_t context;

  explicit Jurischain(uint8_t d, const void *seed, size_t inlen) {
    std::memset(&context, 0, sizeof(context));
    jurischain_gen(&context, d, seed, inlen);
  }

  ~Jurischain() {
    std::memset(&context, 0, sizeof(context));
  }

  static NAN_METHOD(New) {
    if (!info.IsConstructCall()) {
      return Nan::ThrowError("Jurischain must be called with the new keyword");
    }

    if (info.Length() < 2) {
      return Nan::ThrowTypeError("expected 2 arguments: difficulty (number) and seed (string)");
    }

    if (!info[0]->IsNumber()) {
      return Nan::ThrowTypeError("difficulty must be a number");
    }

    double rawDifficulty = Nan::To<double>(info[0]).FromMaybe(0.0);

    if (rawDifficulty != static_cast<int>(rawDifficulty)) {
      return Nan::ThrowTypeError("difficulty must be an integer");
    }

    if (rawDifficulty < 1 || rawDifficulty > 255) {
      return Nan::ThrowRangeError("difficulty must be between 1 and 255");
    }

    if (!info[1]->IsString()) {
      return Nan::ThrowTypeError("seed must be a string");
    }

    Nan::Utf8String seed(info[1]);

    if (seed.length() <= 0 || *seed == nullptr) {
      return Nan::ThrowTypeError("seed must be a non-empty string");
    }

    uint8_t difficulty = static_cast<uint8_t>(rawDifficulty);
    Jurischain *obj = new Jurischain(difficulty,
        static_cast<const void *>(*seed), seed.length());
    obj->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
  }

  static NAN_METHOD(Verify) {
    Jurischain *obj = Nan::ObjectWrap::Unwrap<Jurischain>(info.This());
    info.GetReturnValue().Set(
        Nan::New<v8::Boolean>(jurischain_verify(&obj->context) != 0));
  }

  static NAN_METHOD(Solve) {
    Jurischain *obj = Nan::ObjectWrap::Unwrap<Jurischain>(info.This());
    info.GetReturnValue().Set(
        Nan::New<v8::Boolean>(jurischain_try(&obj->context) != 0));
  }

  static NAN_METHOD(Define) {
    if (info.Length() < 1) {
      return Nan::ThrowTypeError("expected 1 argument: hex response string");
    }

    if (!info[0]->IsString()) {
      return Nan::ThrowTypeError("response must be a string");
    }

    Nan::Utf8String response(info[0]);
    const int expectedLen = HASH_LEN * 2;

    if (response.length() != expectedLen) {
      return Nan::ThrowRangeError(
          "response must be exactly 64 hex characters");
    }

    const char *hex = *response;
    if (hex == nullptr) {
      return Nan::ThrowTypeError("response string is invalid");
    }

    Jurischain *obj = Nan::ObjectWrap::Unwrap<Jurischain>(info.This());

    for (size_t i = 0; i < HASH_LEN; i++) {
      if (std::sscanf(hex + (i * 2), "%02hhX", &obj->context.seed[i]) != 1) {
        std::memset(obj->context.seed, 0, HASH_LEN);
        char errmsg[64];
        std::snprintf(errmsg, sizeof(errmsg),
            "response contains invalid hex at position %zu", i * 2);
        return Nan::ThrowError(errmsg);
      }
    }

    info.GetReturnValue().Set(Nan::New<v8::Boolean>(true));
  }

  static NAN_METHOD(Retrieve) {
    Jurischain *obj = Nan::ObjectWrap::Unwrap<Jurischain>(info.This());

    char str[(HASH_LEN * 2) + 1] = { 0 };
    for (int i = 0; i < HASH_LEN; i++) {
      std::snprintf(str + (i * 2), 3, "%02hhX", obj->context.seed[i]);
    }

    info.GetReturnValue().Set(Nan::New(str).ToLocalChecked());
  }
};

NODE_MODULE(Jurischain, Jurischain::Init);
