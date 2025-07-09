import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-dev-secret";

export function signJwt(payload: object) {
  return jwt.sign(payload, JWT_SECRET);
}

export function jwtVerify(token : string) : string{
  try{
    const decoded = jwt.verify(token,JWT_SECRET) as {name:string};
    return decoded.name;
  }
  catch{
    return "Not found";
  }
}